import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Modal,
  Backdrop,
  Fade,
  TextField,
  Snackbar,
  SnackbarContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ShoppingBasket = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("http://101.201.67.182:5000/get-cart");
      const data = await response.json();

      // 获取每本书的优惠券信息
      const cartWithCoupons = await Promise.all(
        data.cart.map(async (book) => {
          const couponResponse = await fetch(
            `http://101.201.67.182:5000/coupons`
          );
          const couponsData = await couponResponse.json();
          if (couponsData[book.merchant] != null) {
            return { ...book, coupons: couponsData[book.merchant].coupons[0] };
          }
          return { ...book, coupons: [] };
        })
      );
      setCart(cartWithCoupons);
    } catch (error) {
      console.error("获取购物车数据出错:", error);
    }
  };

  const calculateDiscountedPrice = (book) => {
    const storeCoupons = book.coupons;
    // console.log("storeCoupons", storeCoupons[0]);
    if (storeCoupons != null) {
      const discountValue = parseFloat(storeCoupons.discount_value);
      const originalPrice = parseFloat(book.price);
      const discountedPrice = originalPrice * (1 - discountValue / 100);
      return discountedPrice.toFixed(2);
    }
    // console.log("book.price", book.price);
    return book.price;
  };

  const handleCheckout = () => {
    navigate("/customer-dashboard/shopping-cart/checkout");
  };

  const handleRemoveFromCart = async (book) => {
    // console.log("book", book);
    try {
      const response = await fetch(
        "http://101.201.67.182:5000/remove-from-cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(book),
        }
      );
      const data = await response.json();
      // console.log("data", data);
      setCart(data.cart);
    } catch (error) {
      console.error("移除购物车数据出错:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch("http://101.201.67.182:5000/clear-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("清空购物车数据出错:", error);
    }
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setOpenModal(true);
  };

  const handleAdjustQuantity = async (book, newQuantity) => {
    try {
      const response = await fetch(
        "http://101.201.67.182:5000/adjust-quantity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            book: book,
            quantity: newQuantity,
          }),
        }
      );
      const data = await response.json();
      setCart(data.cart);
      setSnackbarMessage("订单数量已成功修改");
      setSnackbarOpen(true);
      fetchCart();
    } catch (error) {
      console.error("调整数量出错:", error);
      setSnackbarMessage("调整数量出错，请重试");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const modalBody = (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        width: 400,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <Typography variant="h5" gutterBottom>
        {selectedBook && selectedBook.title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {selectedBook && selectedBook.book_name}
      </Typography>
      <Typography variant="body1" color="textPrimary" sx={{ mt: 2 }}>
        {/* 你可以在这里添加更多详细信息 */}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        购物车
      </Typography>
      <Grid container spacing={2}>
        {cart.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={"/" + book.image_path}
                alt={book.book_name}
                onClick={() => handleViewDetails(book)}
                sx={{ cursor: "pointer" }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {book.book_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  作者: {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`价格: ¥${book.price} ${
                    calculateDiscountedPrice(book) < book.price
                      ? `(原价: ¥${book.price})`
                      : ``
                  }`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  数量: {book.quantity}
                </Typography>
                <TextField
                  type="number"
                  value={book.quantity}
                  onChange={(e) =>
                    handleAdjustQuantity(book, parseInt(e.target.value, 10))
                  }
                  inputProps={{ min: 1 }}
                  label="当前选择的书本数量"
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleAdjustQuantity(book, book.quantity - 1)}
                >
                  -
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleAdjustQuantity(book, book.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => handleRemoveFromCart(book)}
                >
                  移除
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCheckout}>
          结算
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClearCart}
          sx={{ ml: 2 }}
        >
          清空购物车
        </Button>
      </Box>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>{modalBody}</Fade>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <SnackbarContent message={snackbarMessage} />
      </Snackbar>
    </Box>
  );
};

export default ShoppingBasket;
