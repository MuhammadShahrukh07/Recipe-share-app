import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  Card,
  Row,
  Col,
  Typography,
  Layout,
  Button,
  Modal,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Title } = Typography;
const { Header, Content } = Layout;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();
  const [navLoading, setNavLoading] = useState(false);


  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      toast.error("Please log in to view favorites");
      navigate("/");
    } else {
      fetchFavorites(data.user.id);
    }
  };

  const fetchFavorites = async (userId) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
    } else {
      const recipeIds = data.map((fav) => fav.recipe_id);
      setFavorites(recipeIds);
      if (recipeIds.length > 0) {
        fetchRecipes(recipeIds);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchRecipes = async (recipeIds) => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .in("id", recipeIds);

    if (error) {
      toast.error(error.message);
    } else {
      setRecipes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading favorites...
      </p>
    );
  }

  const handleBackToHome = () => {
  setNavLoading(true);
  setTimeout(() => {
    navigate("/recipe");
  }, 800); // delay for UX effect
};


  return (
    <Layout
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100%",
        background: "#f9f9f9",
      }}
    >
      {/* Responsive Header */}
      <Header
        style={{
          background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          flexWrap: "wrap",
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            color: "#fff",
            fontWeight: 700,
            fontSize: "clamp(18px, 2vw, 24px)", // Responsive font size
            textAlign: "center",
          }}
        >
          ❤️ My Favorites
        </Title>
<Button
  type="primary"
  onClick={handleBackToHome}
  style={{
    background: "#fff",
    color: "#1890ff",
    fontWeight: 600,
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    marginTop: "8px",
    fontSize: "clamp(14px, 1.5vw, 16px)",
  }}
>
  Back to Home
</Button>


        {/* <Button
          type="primary"
          onClick={() => navigate("/recipe")}
          style={{
            background: "#fff",
            color: "#1890ff",
            fontWeight: 600,
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            marginTop: "8px",
            fontSize: "clamp(14px, 1.5vw, 16px)",
          }}
        >
          Back to Home
        </Button> */}
      </Header>

      <Content style={{ padding: "10px" }}>
        {recipes.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: "16px" }}>
            No favorite recipes yet.
          </p>
        ) : (
          <Row gutter={[16, 16]} justify="center">
            {recipes.map((recipe) => (
              <Col xs={24} sm={12} md={8} lg={6} key={recipe.id}>
                <Card
                  hoverable
                  onClick={() => setSelectedRecipe(recipe)}
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
                      onError={(e) => (e.target.src = "/fallback-image.jpg")}
                    />
                  }
                  title={
                    <strong
                      style={{
                        fontSize: "clamp(14px, 1.5vw, 16px)",
                      }}
                    >
                      {recipe.title}
                    </strong>
                  }
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <p
                    style={{
                      color: "#555",
                      marginBottom: "8px",
                      fontSize: "clamp(12px, 1.2vw, 14px)",
                    }}
                  >
                    {recipe.description.length > 80
                      ? recipe.description.substring(0, 80) + "..."
                      : recipe.description}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Content>

      {/* ✅ Modal for Full Details */}
      <Modal
        open={!!selectedRecipe}
        onCancel={() => setSelectedRecipe(null)}
        footer={null}
        width="90%"
        style={{ maxWidth: "700px" }}
        bodyStyle={{ padding: "16px" }}
      >
        {selectedRecipe && (
          <div>
            <img
              src={selectedRecipe.image_url}
              alt={selectedRecipe.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            />
            <Title level={4}>{selectedRecipe.title}</Title>

            <p
              style={{
                whiteSpace: "pre-line",
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              {selectedRecipe.description}
            </p>

            <h3>Ingredients:</h3>
            <ul  style={{
          textAlign: "left",       // Align to left
          fontSize: "16px",        // Increase font size
          lineHeight: "1.8",       // Spacing for readability
          paddingLeft: "20px",
        }}>
              {selectedRecipe.ingredients?.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      {navLoading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
    }}
  >
    <Spin size="large" tip="Navigating..." />
  </div>
)}

    </Layout>
  );
};

export default Favorites;
