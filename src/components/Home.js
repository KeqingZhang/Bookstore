import React from "react";
import { Typography, Button, Box, Container } from "@mui/material";
import { CSSTransition } from "react-transition-group";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // 引入样式文件

const Home = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/login"); // 跳转到登录页面
  };

  return (
    <Container className="home-container">
      <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
        <Box
          className="home-box"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          padding={3}
          boxShadow={3}
          borderRadius={2}
        >
          <Typography variant="h3" gutterBottom>
            Snitch商城
          </Typography>
          <Typography variant="h5" gutterBottom>
            您所信赖的图书市场
          </Typography>
          <Button variant="contained" color="primary" onClick={handleEnter}>
            进入商城
          </Button>
        </Box>
      </CSSTransition>
    </Container>
  );
};

export default Home;
