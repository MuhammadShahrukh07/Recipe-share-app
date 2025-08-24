import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabase";
import {
  Card,
  Button,
  Row,
  Col,
  FloatButton,
  Space,
  Typography,
  Layout,
  Modal,
  Input,
  Form,
  Dropdown,
  Menu,
  Avatar,
  Drawer,
  Badge,
  Spin,
} from "antd";
import {
  PlusOutlined,
  HeartOutlined,
  DeleteOutlined,
  LogoutOutlined,
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  UploadOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Header, Content } = Layout;

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [navLoading, setNavLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);



  // ✅ Fetch user and profile
  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    setCurrentUser(data.user);
    if (data.user) {
      fetchFavorites(data.user.id);
      fetchProfile(data.user.id);
    }
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRecipes(data);
  };

  const fetchFavorites = async (userId) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", userId);
    if (!error) setFavorites(data.map((fav) => fav.recipe_id));
  };

  // ✅ Handle avatar upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    const fileName = `${currentUser.id}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Error uploading avatar");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: currentUser.id,
        email: currentUser.email,
        avatar_url: avatarUrl,
      });

    if (updateError) toast.error("Error updating profile");
    else {
      toast.success("Profile picture updated!");
      setProfile({ ...profile, avatar_url: avatarUrl });
    }
  };

  const handleSaveFavorite = async (recipe) => {
    if (!currentUser) {
      toast.error("Please login first!");
      return;
    }

    const isFavorite = favorites.includes(recipe.id);
    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("recipe_id", recipe.id);
      setFavorites(favorites.filter((id) => id !== recipe.id));
      toast.info(`${recipe.title} removed from favorites.`);
    } else {
      await supabase.from("favorites").insert([
        {
          user_id: currentUser.id,
          recipe_id: recipe.id,
        },
      ]);
      setFavorites([...favorites, recipe.id]);
      toast.success(`${recipe.title} added to favorites!`);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Recipe deleted!");
      fetchRecipes();
      setSelectedRecipe(null);
    }
  };

 const handleLogout = async () => {
  setLogoutLoading(true);
  try {
    await supabase.auth.signOut();
    toast.success("Logged out successfully!");
    setTimeout(() => {
      navigate("/");
    }, 800);
  } catch (error) {
    toast.error("Error during logout");
  } finally {
    setLogoutLoading(false);
  }
};


  const handleEdit = () => {
    setEditMode(true);
    form.setFieldsValue({
      title: selectedRecipe.title,
      description: selectedRecipe.description,
      ingredients: Array.isArray(selectedRecipe.ingredients)
        ? selectedRecipe.ingredients.join(", ")
        : selectedRecipe.ingredients,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      const updatedRecipe = {
        title: values.title,
        description: values.description,
        ingredients: values.ingredients
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };

      const { error } = await supabase
        .from("recipes")
        .update(updatedRecipe)
        .eq("id", selectedRecipe.id);

      if (error) throw error;

      toast.success("Recipe updated successfully!");
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) =>
          r.id === selectedRecipe.id ? { ...r, ...updatedRecipe } : r
        )
      );
      setSelectedRecipe((prev) => ({ ...prev, ...updatedRecipe }));
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || "Failed to update recipe");
    }
  };

  useEffect(() => {
    fetchRecipes();
    getCurrentUser();
  }, []);

  const handleNavigateFavorites = () => {
  setNavLoading(true);
  setTimeout(() => {
    navigate("/favorites");
  }, 800); // short delay for smooth UX
};

  const menu = (
    <Menu>
      <Menu.Item key="email" disabled>
        {currentUser?.email}
      </Menu.Item>
      <Menu.Item key="update" onClick={() => fileInputRef.current.click()}>
        <UploadOutlined /> Update Profile Picture
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} danger>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh", minWidth:"100vw", background: "#f9f9f9" }}>
      {/* ✅ Responsive Header */}
      <Header
        style={{
          background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            color: "#fff",
            fontWeight: 700,
            fontSize: "clamp(18px, 2vw, 24px)",
          }}
        >
          🍴 Recipe Share
        </Title>

        {/* Desktop Menu */}
        <Space
          size="large"
          className="desktop-menu"
          style={{ display: "none" }}
        >
          <Badge
            count={favorites.length}
            offset={[8, 0]}
            style={{
              backgroundColor: "#fff",
              color: "#1890ff",
              fontWeight: "bold",
            }}
          >
            <Button
  onClick={handleNavigateFavorites}
  style={{
    background: "#fff",
    color: "#1890ff",
    fontWeight: 600,
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  }}
>
  Favorites
</Button>
          </Badge>

          {currentUser && (
            <>
              <Dropdown overlay={menu} placement="bottomRight">
                <Avatar
                  size={{ xs: 28, sm: 36, md: 44, lg: 48, xl: 56 }}
                  src={profile?.avatar_url || null}
                  icon={!profile?.avatar_url && <UserOutlined />}
                  style={{
                    backgroundColor: "#fff",
                    color: "#1890ff",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </Dropdown>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleAvatarUpload(e.target.files[0])}
              />
            </>
          )}
        </Space>

        {/* Mobile Menu Icon */}
        <MenuOutlined
          onClick={() => setDrawerVisible(true)}
          style={{ fontSize: 24, color: "#fff", display: "block" }}
          className="mobile-menu-icon"
        />
      </Header>

      {/* Drawer for Mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
         <Button type="primary" onClick={handleNavigateFavorites}>
  Favorites ({favorites.length})
</Button>
          {currentUser && (
            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar
                size={48}
                src={profile?.avatar_url || null}
                icon={!profile?.avatar_url && <UserOutlined />}
                style={{
                  backgroundColor: "#87d068",
                  cursor: "pointer",
                }}
              />
            </Dropdown>
          )}
        </Space>
      </Drawer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-icon {
            display: none !important;
          }
        }
      `}</style>

      {/* ✅ Content */}
      <Content style={{ padding: "16px" }}>
        <Row gutter={[16, 16]} justify="center">
          {recipes.map((recipe) => (
            <Col xs={24} sm={12} md={8} lg={6} key={recipe.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={recipe.title}
                    src={recipe.image_url}
                    style={{
                      height: 200,
                      width: "100%",
                      objectFit: "cover",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                  />
                }
                title={<strong>{recipe.title}</strong>}
                actions={[
                  <HeartOutlined
                    key="favorite"
                    style={{
                      color: favorites.includes(recipe.id) ? "red" : "gray",
                    }}
                    onClick={() => handleSaveFavorite(recipe)}
                  />,
                  currentUser && currentUser.id === recipe.user_id && (
                    <DeleteOutlined
                      key="delete"
                      onClick={() => handleDelete(recipe.id)}
                      style={{ color: "red" }}
                    />
                  ),
                ]}
                style={{
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <p style={{ color: "#555", marginBottom: "8px" }}>
                  {recipe.description.length > 80
                    ? recipe.description.substring(0, 80) + "..."
                    : recipe.description}
                </p>
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setEditMode(false);
                  }}
                  style={{ padding: 0 }}
                >
                  Read More
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      {/* ✅ Floating Add Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          borderRadius: "50%",
        }}
        onClick={() => navigate("/add")}
      />

      {/* ✅ Responsive Modal */}
      {selectedRecipe && (
        <Modal
          title={editMode ? "Edit Recipe" : <strong>{selectedRecipe.title}</strong>}
          open={!!selectedRecipe}
          onCancel={() => {
            setSelectedRecipe(null);
            setEditMode(false);
          }}
          footer={
            editMode
              ? [
                  <Button key="cancel" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>,
                  <Button
                    key="save"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveEdit}
                  >
                    Save
                  </Button>,
                ]
              : [
                  currentUser &&
                    currentUser.id === selectedRecipe.user_id && (
                      <Button
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                      >
                        Edit
                      </Button>
                    ),
                  <Button key="close" onClick={() => setSelectedRecipe(null)}>
                    Close
                  </Button>,
                ]
          }
          width="95%"
          style={{ maxWidth: 700 }}
        >
          {editMode ? (
            <Form layout="vertical" form={form}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please enter title" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item
                label="Ingredients (comma separated)"
                name="ingredients"
                rules={[{ required: true, message: "Please enter ingredients" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          ) : (
            <>
              <img
                src={selectedRecipe.image_url}
                alt={selectedRecipe.title}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  objectFit: "cover",
                  maxHeight: "300px",
                }}
              />

              <Typography.Paragraph
                style={{ marginBottom: "15px", whiteSpace: "pre-line", fontSize: "16px"}}
              >
                <strong>Description:</strong>
                <br />
                {selectedRecipe.description}
              </Typography.Paragraph>

              <Typography.Title level={5}>Ingredients:</Typography.Title>
              <ul style={{ paddingLeft: "20px", marginTop: 0, fontSize: "16px" }}>
                {Array.isArray(selectedRecipe.ingredients)
                  ? selectedRecipe.ingredients.map((item, index) => (
                      <li key={index} style={{ marginBottom: "6px" }}>
                        {item}
                      </li>
                    ))
                  : selectedRecipe.ingredients
                      .split(",")
                      .map((item, index) => (
                        <li key={index} style={{ marginBottom: "6px" }}>
                          {item.trim()}
                        </li>
                      ))}
              </ul>
            </>
          )}
        </Modal>
      )}
      {navLoading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255,255,255,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <Spin size="large" tip="Loading Favorites..." />
  </div>
)}
{logoutLoading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255,255,255,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
    }}
  >
    <Spin size="large" tip="Logging out..." />
  </div>
)}
    </Layout>
  );
};

export default RecipeList;
