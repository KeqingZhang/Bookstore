import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const Checkout = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [discountedItems, setDiscountedItems] = useState([]);
  const [nonDiscountedItems, setNonDiscountedItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState("");
  // const [user, setUser] = useState({});

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("http://101.201.67.182:5000/apply-discount");
      if (!response.ok) {
        throw new Error("获取购物车数据失败");
      }
      const data = await response.json();
      setDiscountedItems(data.discounted_items);
      setNonDiscountedItems(data.non_discounted_items);
    } catch (error) {
      console.error("获取购物车数据出错:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch("http://101.201.67.182:5000/get-user-info");
      if (!response.ok) {
        throw new Error("获取用户信息失败");
      }
      const data = await response.json();
      // setUser(data.user);
      setDefaultAddress(data.user.address);
    } catch (error) {
      console.error("获取用户信息出错:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/customer-dashboard/shopping-cart/complete");
  };

  const handleCheckout = async () => {
    try {
      const cart = [...discountedItems, ...nonDiscountedItems];
      console.log(cart);
      const response = await fetch("http://101.201.67.182:5000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart, address: defaultAddress }),
      });
      if (!response.ok) {
        throw new Error("结账失败");
      }
      setDiscountedItems([]);
      setNonDiscountedItems([]);

      handleClose();
    } catch (error) {
      console.error("结账出错:", error);
    }
  };

  const totalAmount = (
    discountedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    nonDiscountedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  ).toFixed(2);

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        结账
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <TableContainer component={Paper} sx={{ width: "60%" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>书名</TableCell>
                <TableCell align="right">单价 (¥)</TableCell>
                <TableCell align="right">数量</TableCell>
                <TableCell align="right">总价 (¥)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discountedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.book_name} (打折)</TableCell>
                  <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {nonDiscountedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.book_name} (未打折)</TableCell>
                  <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow key="total">
                <TableCell component="th" scope="row">
                  总金额
                </TableCell>
                <TableCell align="right" colSpan={3}>
                  {totalAmount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexDirection: "column",
        }}
      >
        <TextField
          id="address-input"
          label="设置收货地址"
          variant="outlined"
          value={defaultAddress}
          onChange={(e) => setDefaultAddress(e.target.value)}
          sx={{ width: "60%", alignSelf: "center" }}
        />
        <Button
          variant="contained"
          onClick={() =>
            navigate("/customer-dashboard/shopping-cart/shopping-basket")
          }
          sx={{ width: "60%", alignSelf: "center" }}
        >
          返回购物车
        </Button>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ width: "60%", alignSelf: "center" }}
        >
          去支付
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>支付二维码</DialogTitle>
        <DialogContent>
          <DialogContentText>
            请使用手机扫描以下二维码进行支付。
          </DialogContentText>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="/homepage/cenima.png"
              alt="QR Code"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCheckout} color="primary" autoFocus>
            完成支付
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Checkout;
