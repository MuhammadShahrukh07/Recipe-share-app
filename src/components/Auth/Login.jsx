import React, { useState } from "react";
import { supabase } from "../../supabase";
import { Form, Input, Button, Typography, Row, Col, Card, Spin } from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    const { email, password } = values;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/recipe");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          "url('https://img.freepik.com/free-vector/cartoon-style-recipe-note-with-ingredients_52683-79718.jpg?semt=ais_hybrid&w=740&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      {/* ✅ Full-Screen Spinner */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin size="large" tip="Logging in..." />
        </div>
      )}

      <Row
        justify="center"
        align="middle"
        style={{
          width: "100%",
          height: "100%",
        
        }}
      >

        <Col xs={22} sm={18} md={12} lg={8} xl={6}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
              Login
            </Title>
            <Form layout="vertical" onFinish={handleLogin}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please enter your email" }]}
              >
                <Input type="email" size="large" placeholder="Enter your email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password size="large" placeholder="Enter your password" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                  border: "none",
                }}
              >
                Login
              </Button>
            </Form>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Text>
                Don't have an account?{" "}
                <a href="/signup" style={{ color: "#1890ff" }}>
                  Sign Up
                </a>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
