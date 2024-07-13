import React from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  //   Fade,
  Divider,
} from "@mui/material";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const BookDetail = ({ book, addToCart }) => {
  const {
    imageUrl,
    title,
    author,
    description,
    merchant,
    price,
    discount,
    couponAvailable,
  } = book;
  const discountedPrice = couponAvailable
    ? (price * discount).toFixed(2)
    : null;

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
            <img
              src={imageUrl}
              alt={title}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {title}
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
            {couponAvailable && (
              <Typography variant="subtitle1" gutterBottom color="primary">
                打折价格: ¥{discountedPrice}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => addToCart(book)}
              sx={{ mt: 2 }}
            >
              加入购物车
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BookDetail;
