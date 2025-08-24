import React, { useState } from "react";
import { supabase } from "../../supabase";
import {
  Form,
  Input,
  Button,
  Upload,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Spin,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const RecipeForm = () => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!imageFile) return null;

    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data, error } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, imageFile);

    if (error) {
      toast.error("Image upload failed");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const imageUrl = await handleUpload();
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const { title, description, ingredients } = values;

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        description,
        image_url: imageUrl,
        ingredients: ingredients,
        user_id: (await supabase.auth.getUser()).data.user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Recipe added successfully!");
      navigate("/recipe");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9f9",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* ✅ Full-Screen Spinner Overlay */}
      {loading && (
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
            zIndex: 1000,
          }}
        >
          <Spin size="large" tip="Uploading Recipe..." />
        </div>
      )}

      <Card
        style={{
          width: "100%",
          maxWidth: "700px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
          Add New Recipe
        </Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          {/* Title */}
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter recipe title" }]}
          >
            <Input placeholder="Enter recipe title" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter recipe description" />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item
            label="Upload Image"
            name="image"
            rules={[{ required: true, message: "Please upload an image" }]}
          >
            <Upload
              beforeUpload={(file) => {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                return false;
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  marginTop: "10px",
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            )}
          </Form.Item>

          {/* Ingredients */}
          <Form.List name="ingredients" initialValue={[""]}>
            {(fields, { add, remove }) => (
              <>
                <label style={{ fontWeight: "500", marginBottom: "8px" }}>
                  Ingredients
                </label>
                {fields.map(({ key, name }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      width: "100%",
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      name={name}
                      rules={[
                        { required: true, message: "Please enter ingredient" },
                      ]}
                      style={{ flex: 1 }}
                    >
                      <Input placeholder="Enter ingredient" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: "red", fontSize: "18px" }}
                      />
                    )}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                  style={{ marginBottom: "16px" }}
                >
                  Add Ingredient
                </Button>
              </>
            )}
          </Form.List>

          {/* Submit Button */}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: "45px",
              fontSize: "16px",
              background: "#1890ff",
              borderRadius: "8px",
            }}
          >
            Submit Recipe
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default RecipeForm;
