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
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import axios from "axios";
import "./BookDetail.css";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const BookDetail = ({
  book,
  addToCart,
  removeFromCart,
  updateCartQuantity,
}) => {
  const { id, book_name, price, merchant, description, author, stock } = book;
  const imagePath = `/images/${id}.jpg`;
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const commentsPerPage = 10;

  useEffect(() => {
    // Reset quantity when book changes
    setQuantity(1);
    fetchComments();
  }, [book]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${BOOKSTORE_BACKEND_URL}/get-book-comments`,
        {
          params: { book_id: id },
        }
      );
      // 对评论进行倒序排序
      const sortedComments = response.data.sort(
        (a, b) => b.comment_id - a.comment_id
      );
      setComments(sortedComments);
      setTotalPages(Math.ceil(sortedComments.length / commentsPerPage));
    } catch (error) {
      console.error("获取评论数据出错:", error);
    }
  };

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

  const handleAddComment = async () => {
    try {
      await axios.post(`${BOOKSTORE_BACKEND_URL}/add-book-comments`, {
        book_id: id,
        context: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("添加评论出错:", error);
    }
  };

  const handleLikeComment = async (comment_id) => {
    try {
      await axios.post(`${BOOKSTORE_BACKEND_URL}/like-book-comment`, {
        comment_id,
      });
      fetchComments();
    } catch (error) {
      console.error("点赞出错:", error);
    }
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const displayedComments = comments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  return (
    <Container component="main" maxWidth="xl">
      <Box
        sx={{
          width: "80%",
          margin: "0 auto",
          padding: 3,
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "#fff",
          textAlign: "left",
          overflow: "auto",
          maxHeight: "90vh",
        }}
      >
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="书籍详情" />
          <Tab label="评论" />
        </Tabs>
        {tabIndex === 0 && (
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
        )}
        {tabIndex === 1 && (
          <Box sx={{ mt: 4 }}>
            <TextField
              label="留下您的评论吧~"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ mb: 4 }}
            >
              提交评论
            </Button>
            {displayedComments.map((comment) => (
              <Paper key={comment.comment_id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {comment.comment_id}:
                  </Typography>
                  <Typography variant="body1">{comment.context}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <IconButton
                    onClick={() => handleLikeComment(comment.comment_id)}
                    disabled={comment.liked}
                  >
                    {comment.liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {comment.like_num}
                  </Typography>
                </Box>
              </Paper>
            ))}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Typography variant="body1" sx={{ mx: 2 }}>
                {currentPage} / {totalPages}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BookDetail;
