import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
// import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CommentIcon from "@mui/icons-material/Comment";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
// import StarBorder from "@mui/icons-material/StarBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Box, Drawer, ListItem, Badge } from "@mui/material";
import axios from "axios";
import "./CustomerDashboard.css"; // Import CSS file for custom styles

// 新建一个函数组件来获取未读评论数量并显示Badge
const CommentIconWithBadge = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          "http://101.201.67.182:5000/comments/unread/count"
        );
        if (response.data) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching unread comments count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // 每分钟刷新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge badgeContent={unreadCount} color="primary">
      <CommentIcon />
    </Badge>
  );
};

const navItems = [
  { to: "shopping-cart", text: "购物", icon: <InboxIcon /> },
  { to: "track-order", text: "物流追踪", icon: <HistoryIcon /> },
  { to: "purchase-history", text: "消费历史", icon: <ReceiptIcon /> },
  { to: "coupon", text: "优惠券", icon: <LoyaltyIcon /> },
  { to: "modify-user-info", text: "修改用户信息", icon: <AccountCircleIcon /> },
  { to: "comments", text: "评论", icon: <CommentIconWithBadge /> }, // 使用带有未读评论数量的评论图标
];

export default function CustomerDashboard() {
  // const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  // const handleClick = () => {
  //   setOpen(!open);
  // };

  const handleLogout = async () => {
    try {
      // 清空后端的 user_data.json 文件
      await axios.post("http://101.201.67.182:5000/customer-logout");
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
              用户操作界面
            </ListSubheader>
          }
        >
          {navItems.map((item, index) => (
            <ListItem
              key={index}
              button
              component={Link}
              to={`/customer-dashboard/${item.to}`}
              sx={{ py: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          {/* <ListItemButton onClick={handleClick} sx={{ py: 1 }}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4, py: 1 }}>
                <ListItemIcon>
                  <StarBorder />
                </ListItemIcon>
                <ListItemText primary="Starred" />
              </ListItemButton>
            </List>
          </Collapse> */}
          {/* Logout Button */}
          <ListItemButton onClick={handleLogout} sx={{ py: 1 }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="退出登录" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
