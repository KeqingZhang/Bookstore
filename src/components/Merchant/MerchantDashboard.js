import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
// import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import StorageIcon from "@mui/icons-material/Storage";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
// import StarBorder from "@mui/icons-material/StarBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import axios from "axios";
import "./MerchantDashboard.css"; // Import CSS file for custom styles

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const navItems = [
  { to: "add-book", text: "添加商家书籍", icon: <InboxIcon /> },
  { to: "product-management", text: "商品管理", icon: <InboxIcon /> },
  { to: "inventory-management", text: "库存管理", icon: <StorageIcon /> },
  { to: "revenue-analysis", text: "营收分析", icon: <BarChartIcon /> },
  { to: "transaction-history", text: "交易记录", icon: <HistoryIcon /> },
  { to: "merchant-comments", text: "管理员评论", icon: <InboxIcon /> },
  { to: "modify-merchant-info", text: "商家信息修改", icon: <EditIcon /> },
];

export default function MerchantDashboard() {
  // const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  // const handleClick = () => {
  //   setOpen(!open);
  // };

  const handleLogout = async () => {
    try {
      // 清空后端的 user_data.json 文件
      await axios.post(`${BOOKSTORE_BACKEND_URL}/logout`);
      // 清空本地存储
      localStorage.clear();
      // 重定向到主页
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
              商家操作界面
            </ListSubheader>
          }
        >
          {navItems.map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              component={Link}
              to={`/merchant-dashboard/${item.to}`}
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          {/* <ListItem disablePadding>
            <ListItemButton onClick={handleClick}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <StarBorder />
                  </ListItemIcon>
                  <ListItemText primary="Starred" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse> */}
          <ListItemButton onClick={handleLogout} sx={{ py: 1 }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="退出登录" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
