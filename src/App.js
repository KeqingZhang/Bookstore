import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/Customer/CustomerDashboard";
import ShoppingCart from "./components/Customer/ShoppingCart";
import TrackOrder from "./components/Customer/TrackOrder";
import PurchaseHistory from "./components/Customer/PurchaseHistory";
import CouponCustomer from "./components/Customer/Coupon";
import ModifyUserInfo from "./components/Customer/ModifyUserInfo";
import CommentsPage from "./components/Customer/warning"; // 导入 CommentsPage 组件
import AdminDashboard from "./components/Admin/AdminDashboard";
import OrderPage from "./components/Admin/OrderPage";
import StorePage from "./components/Admin/StorePage";
import UserPage from "./components/Admin/UserPage";
import AdminAccountSettings from "./components/Admin/AdminAccountSettings";
import MerchantDashboard from "./components/Merchant/MerchantDashboard";
import Addbook from "./components/Merchant/Addbook";
import ProductManagement from "./components/Merchant/ProductManagement";
import InventoryManagement from "./components/Merchant/InventoryManagement";
import RevenueAnalysis from "./components/Merchant/RevenueAnalysis";
import TransactionHistory from "./components/Merchant/TransactionHistory";
import ModifyMerchantInfo from "./components/Merchant/ModifyMerchantInfo";
import MerchantComments from "./components/Merchant/MerchantComments";
import "./App.css";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#303030" : "#f5f5dc",
        paper: darkMode ? "#424242" : "#fff",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <AppBar position="fixed">
            <Toolbar>
              <img
                src="/logo.png"
                alt="Snitch Logo"
                style={{
                  marginRight: "16px",
                  height: "40px",
                  width: "40px",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Snitch商城
              </Typography>
              <Button color="inherit" component={Link} to="/home">
                主页
              </Button>
              <Button color="inherit" component={Link} to="/login">
                登录
              </Button>
              <Button color="inherit" component={Link} to="/register">
                注册
              </Button>
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{
                  marginLeft: "auto",
                  bgcolor: darkMode ? "#616161" : "#e0e0e0",
                  "&:hover": {
                    bgcolor: darkMode ? "#424242" : "#bdbdbd",
                  },
                }}
              >
                <Brightness4Icon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ pt: 8 }}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/customer-dashboard/*"
                element={<CustomerDashboard />}
              >
                <Route path="shopping-cart/*" element={<ShoppingCart />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="purchase-history" element={<PurchaseHistory />} />
                <Route path="modify-user-info" element={<ModifyUserInfo />} />
                <Route path="coupon" element={<CouponCustomer />} />
                <Route path="comments" element={<CommentsPage />} />{" "}
                {/* 添加 CommentsPage 路由 */}
              </Route>
              <Route path="/admin-dashboard/*" element={<AdminDashboard />}>
                <Route path="orders" element={<OrderPage />} />
                <Route path="stores" element={<StorePage />} />
                <Route path="users" element={<UserPage />} />
                <Route path="settings" element={<AdminAccountSettings />} />
              </Route>

              <Route
                path="/merchant-dashboard/*"
                element={<MerchantDashboard />}
              >
                <Route path="add-book" element={<Addbook />}></Route>
                <Route
                  path="product-management"
                  element={<ProductManagement />}
                />
                <Route
                  path="inventory-management"
                  element={<InventoryManagement />}
                />
                <Route path="revenue-analysis" element={<RevenueAnalysis />} />
                <Route
                  path="transaction-history"
                  element={<TransactionHistory />}
                />
                <Route
                  path="modify-merchant-info"
                  element={<ModifyMerchantInfo />}
                />
                <Route
                  path="merchant-comments"
                  element={<MerchantComments />}
                />
              </Route>
            </Routes>
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
