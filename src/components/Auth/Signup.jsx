import React, { useState } from "react";
import { supabase } from "../../supabase";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (values) => {
    setLoading(true);
    const { email, password } = values;

    try {
      // ✅ Sign up user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      const user = data?.user;

      // ✅ Create a profile entry in "profiles" table
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            email: user.email,
            avatar_url: null, // Default avatar initially
          },
        ]);

        if (profileError) {
          console.error("Profile insert error:", profileError.message);
          toast.error("Profile creation failed");
        }
      }

      toast.success("Signup successful! Please check your email.");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
        margin: 0,
        padding: 0,
        overflow: "hidden", // ✅ Prevent scroll
      }}
    >
      <Row
        justify="center"
        align="middle"
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
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
              Sign Up
            </Title>
            <Form layout="vertical" onFinish={handleSignup}>
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
                style={{ borderRadius: "8px",    
                background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                border: "none", // remove the default border for better gradient look
 }}
              >
                Sign Up
              </Button>
            </Form>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Text>
                Already have an account?{" "}
                <a href="/" style={{ color: "#1890ff" }}>
                  Login
                </a>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Signup;
