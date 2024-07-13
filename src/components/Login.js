import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CSSTransition } from "react-transition-group";
import "./Login.css";
import LoadingScreen from "./LoadingScreen"; // 引入新的加载组件

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const Login = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [captcha, setCaptcha] = useState(""); // 新增验证码状态
  const [loading, setLoading] = useState(false); // 新增loading状态
  const [errorDialogOpen, setErrorDialogOpen] = useState(false); // 新增错误弹窗状态
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      let loginEndpoint = "";
      // 根据用户类型选择不同的登录终点
      if (selectedTab === 0) {
        loginEndpoint = `${BOOKSTORE_BACKEND_URL}/customer-login`;
      } else if (selectedTab === 1) {
        loginEndpoint = `${BOOKSTORE_BACKEND_URL}/admin-login`;
      } else if (selectedTab === 2) {
        loginEndpoint = `${BOOKSTORE_BACKEND_URL}/merchant-login`;
      } else {
        console.error("未知用户类型");
        return;
      }

      setLoading(true); // 显示加载页面

      const response = await axios.post(loginEndpoint, {
        username,
        password,
      });

      console.log("登录成功:", response.data);

      let targetPath = "";
      // 设置目标路径
      if (selectedTab === 0) {
        targetPath = "/customer-dashboard";
      } else if (selectedTab === 1) {
        targetPath = "/admin-dashboard";
      } else if (selectedTab === 2) {
        targetPath = "/merchant-dashboard";
      }

      setLoading(false); // 隐藏加载页面
      navigate(targetPath); // 跳转到目标路径
    } catch (error) {
      setLoading(false); // 隐藏加载页面
      setErrorDialogOpen(true); // 显示错误弹窗
      console.error("登录失败:", error);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleDialogClose = () => {
    setErrorDialogOpen(false);
  };

  if (loading) {
    return <LoadingScreen />; // 显示加载组件
  }

  return (
    <Container component="main" maxWidth="xs">
      <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
        <Box
          sx={{
            width: "100%",
            margin: "0 auto",
            textAlign: "center",
            mt: 4,
            mb: 4,
            padding: 3,
            borderRadius: 8,
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#e0e0e0" : "#fff",
            color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#000"),
          }}
        >
          <Typography component="h1" variant="h5">
            欢迎登录Snitch商城
          </Typography>
          <Tabs
            value={selectedTab}
            onChange={handleChange}
            centered
            sx={{ fontSize: "2rem", mt: 3 }}
          >
            <Tab label="用户登录" />
            <Tab label="管理员登录" />
            <Tab label="商家登录" />
          </Tabs>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#f5f5f5" : "transparent",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#000" : "#000",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "#f5f5f5" : "#e0e0e0",
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#f5f5f5" : "transparent",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#000" : "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "#f5f5f5" : "#e0e0e0",
                  },
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <Button type="submit" variant="contained" sx={{ width: "45%" }}>
                登录
              </Button>
              <Box sx={{ width: "10%" }} /> {/* 添加间隔 */}
              <Button
                variant="outlined"
                onClick={handleRegister}
                sx={{ width: "45%" }}
              >
                注册
              </Button>
            </Box>
          </Box>
        </Box>
      </CSSTransition>
      <Dialog open={errorDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>登录失败</DialogTitle>
        <DialogContent>
          <Typography>用户名或密码错误</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
