import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import "./AdminDashboard.css"; // Import CSS file for custom styles

const navItems = [
  { to: "orders", text: "查看订单", icon: <AssignmentIcon /> },
  { to: "stores", text: "查看商店", icon: <StoreIcon /> },
  { to: "users", text: "查看用户", icon: <PeopleIcon /> },
  { to: "settings", text: "账户设置", icon: <SettingsIcon /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 清除后台的用户数据
    fetch("http://101.201.67.182:5000/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        if (data.message === "用户已登出") {
          // 这里清除本地存储的用户数据，并重定向到登录页面
          navigate("/home");
          // history.push("/home");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
            marginTop: "64px", // Adjust to match your app's top bar height
          },
        }}
      >
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader
              component="div"
              id="nested-list-subheader"
              sx={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              管理员操作界面
            </ListSubheader>
          }
        >
          {navItems.map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              component={Link}
              to={`/admin-dashboard/${item.to}`}
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="登出" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
