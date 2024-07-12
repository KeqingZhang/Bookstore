import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Divider,
  CardMedia,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const BookDetail = ({
  book,
  addToCart,
  removeFromCart,
  updateCartQuantity,
}) => {
  const { id, book_name, price, merchant, description, author, stock } = book;
  const imagePath = `/images/${id}.jpg`;
  const [quantity, setQuantity] = useState(1); // 初始数量设置为1

  useEffect(() => {
    // Reset quantity when book changes
    setQuantity(1);
  }, [book]);

  const handleIncrementQuantity = () => {
    if (quantity < stock) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= stock) {
      setQuantity(value);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
          padding: 3,
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "#fff",
          textAlign: "left",
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              height="150"
              image={imagePath}
              alt={book_name}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book_name}
            </Typography>
            <Typography variant="h6" gutterBottom>
              作者: {author}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              商家: {merchant}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              价格: ¥{price}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              库存: {stock}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <IconButton onClick={handleDecrementQuantity}>
                <RemoveIcon />
              </IconButton>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: stock }}
                sx={{ width: 60, mx: 2 }}
              />
              <IconButton onClick={handleIncrementQuantity}>
                <AddIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => addToCart(book, quantity)}
              sx={{ mt: 2 }}
            >
              加入购物车
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => removeFromCart(book)}
              sx={{ mt: 2, ml: 2 }}
            >
              从购物车移除
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BookDetail;
