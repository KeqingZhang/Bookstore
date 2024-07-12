import React from "react";
import {
  Box,
  Typography,
  Button,
  // Grid,
  // Card,
  // CardContent,
  // CardMedia,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Complete = ({ cart }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        订单完成
      </Typography>
      <Typography variant="body1">
        感谢您的购买！以下是您本次交易所购买的书籍：
      </Typography>
      {/* <Grid container spacing={2} sx={{ mt: 3 }}>
        {cart.map((book, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardMedia
                component="img"
                height="150"
                image={book.image}
                alt={book.title}
              />
              <CardContent>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {book.description}
                </Typography>
                <Typography variant="body1" color="textPrimary">
                  ¥{book.price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid> */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() =>
            navigate("/customer-dashboard/shopping-cart/select-product")
          }
        >
          再次购买
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/customer-dashboard/track-order")}
        >
          查看物流情况
        </Button>
      </Box>
    </Box>
  );
};

export default Complete;
