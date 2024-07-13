import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  Container,
  Modal,
  Fab,
  Pagination,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import BookDetail from "./BookDetail"; // 确保你已经导入了BookDetail组件

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const SelectProduct = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12; // 每页显示的书籍数量
  const [showHeader, setShowHeader] = useState(true);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [coupons, setCoupons] = useState({});
  const [quantities, setQuantities] = useState({}); // 新增：记录每本书的数量

  useEffect(() => {
    fetchBooks();
    fetchCart();
    fetchCoupons(); // 获取用户优惠券

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowHeader(false);
        setShowScrollTopButton(true);
      } else {
        setShowHeader(true);
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {}, [coupons]);

  const fetchBooks = async () => {
    try {
      const ngrokUrl = `${BOOKSTORE_BACKEND_URL}/customer-get-books`; // 替换为你实际的Ngrok URL
      const response = await axios.get(ngrokUrl);
      if (response.status !== 200) {
        throw new Error("获取书本数据失败");
      }
      const data = response.data;
      // 处理获取到的书本数据，例如设置状态或者其他操作
      // console.log(data);
      setBooks(data.books);
    } catch (error) {
      console.error("获取书本数据出错:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${BOOKSTORE_BACKEND_URL}/get-cart`);
      if (!response.ok) {
        throw new Error("获取购物车数据失败");
      }
      const data = await response.json();
      setSelectedBooks(data.cart); // 将购物车中的书籍设置为已选择的书籍
      // console.log(data.cart);
      // 初始化数量
      const initialQuantities = {};
      data.cart.forEach((book) => {
        initialQuantities[book.book_id] = book.quantity;
      });
      setQuantities(initialQuantities);
      // console.log(quantities, initialQuantities);
    } catch (error) {
      console.error("获取购物车数据出错:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${BOOKSTORE_BACKEND_URL}/coupons`);
      if (!response.ok) {
        throw new Error("获取优惠券数据失败");
      }
      const data = await response.json();
      setCoupons(data);
      setCoupons(data);
      // console.log("coupons:", coupons, data);
    } catch (error) {
      console.error("获取优惠券数据出错:", error);
    }
  };

  const updateCartQuantity = async (book, quantity) => {
    const storeCoupons = coupons[book.id] || { coupons: [] };
    const remainingCoupons = storeCoupons.coupons.length;

    const discountedQuantity = Math.min(quantity, remainingCoupons);
    const nonDiscountedQuantity = quantity - discountedQuantity;

    try {
      const disprice = calculateDiscountedPrice(book).toFixed(2);
      const response = await fetch(`${BOOKSTORE_BACKEND_URL}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...book,
          quantity,
          discountedQuantity,
          nonDiscountedQuantity,
          disprice,
        }),
      });
      if (!response.ok) {
        throw new Error("更新购物车数量失败");
      }
      const data = await response.json();
      setSelectedBooks(data.cart);
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [book.book_id]: quantity,
      }));
      // window.location.reload();
    } catch (error) {
      console.error("更新购物车数量出错:", error);
    }
  };

  const addToCart = async (book, quantity) => {
    if (quantity <= 0) {
      console.log("==========");
      quantity = 1;
    }
    await updateCartQuantity(book, quantity);
  };

  const removeFromCart = async (book) => {
    try {
      const response = await fetch(
        `${BOOKSTORE_BACKEND_URL}/remove-from-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(book),
        }
      );
      if (!response.ok) {
        throw new Error("移除购物车失败");
      }
      const data = await response.json();
      setSelectedBooks(data.cart);
      setQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        delete newQuantities[book.id];
        return newQuantities;
      });
      // window.location.reload();
    } catch (error) {
      console.error("移除购物车出错:", error);
    }
  };

  const handleSelectBook = async (book) => {
    if (!Array.isArray(selectedBooks)) {
      console.error("selectedBooks is not an array");
      return;
    }
    // console.log("selectedBooks:", selectedBooks);
    // console.log("book:", book);
    if (selectedBooks.some((b) => b.book_id === book.id)) {
      // console.log("book:", book);
      await removeFromCart(book);
    } else {
      console.log(quantities);
      await addToCart(book, quantities[book.id] || 1); // 默认数量为1
    }
    // window.location.reload();
  };

  const handleQuantityChange = async (event, book) => {
    const quantity = parseInt(event.target.value, 10);
    if (!isNaN(quantity)) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [book.id]: quantity,
      }));
      if (quantity === 0) {
        await removeFromCart(book);
      } else {
        await updateCartQuantity(book, quantity);
      }
    }
  };

  const handleIncrementQuantity = async (book) => {
    // console.log("handleIncrementQuantity book:", book);
    const quantity = (quantities[book.id] || 0) + 1;
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [book.id]: quantity,
    }));
    await updateCartQuantity(book, quantity);
  };

  const handleDecrementQuantity = async (book) => {
    const quantity = (quantities[book.id] || 1) - 1;
    if (quantity <= 0) {
      await removeFromCart(book);
    } else {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [book.id]: quantity,
      }));
      await updateCartQuantity(book, quantity);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = async () => {
    try {
      const response = await fetch(
        `${BOOKSTORE_BACKEND_URL}/search-books?category=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error("搜索书本数据失败");
      }
      const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 100));
      setBooks(data.books);
    } catch (error) {
      console.error("搜索书本数据出错:", error);
    }
  };

  const handleBookDetail = (book) => {
    setSelectedBook(book);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // 计算当前页需要显示的书籍
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // 处理分页点击事件
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewCart = () => {
    navigate("/customer-dashboard/shopping-cart/shopping-basket");
  };

  const calculateDiscountedPrice = (book) => {
    const storeCoupons = coupons[book.merchant];

    if (storeCoupons) {
      // console.log(coupons);
      // console.log("storeCoupons:", book, storeCoupons, coupons[book.id]);
      const validCoupons = storeCoupons.coupons.filter(
        (coupon) => new Date(coupon.expiration_date) > new Date()
      );

      const hasCoupons = validCoupons.length > 0;
      if (hasCoupons) {
        const coupon = validCoupons[0];
        const discountValue = parseFloat(coupon.discount_value);
        const originalPrice = parseFloat(book.price);
        const discountedPrice = originalPrice * (1 - discountValue / 100);
        return discountedPrice;
      }
    }
    return book.price;
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          padding: 2,
          marginBottom: 2,
          transition: "transform 0.3s",
          transform: showHeader ? "translateY(0)" : "translateY(-200px)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              选择商品
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <TextField
                label="搜索"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchClick}
                sx={{ marginLeft: 2 }}
              >
                搜索
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleViewCart}
                sx={{ marginLeft: 2 }}
              >
                查看购物车
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        {currentBooks.map((book) => {
          const isSelected = selectedBooks.some((b) => b.book_id === book.id);
          const quantity = quantities[book.id] || 0;
          const discountedPrice = calculateDiscountedPrice(book).toFixed(2);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  alt={book.name}
                  height="200"
                  image={"/" + book.image_path}
                  // image={book.image_path}
                  title={book.book_name}
                  onClick={() => handleBookDetail(book)}
                  sx={{ cursor: "pointer" }}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {book.book_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    作者: {book.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`价格: ¥${discountedPrice} ${
                      discountedPrice < book.price
                        ? `(原价: ¥${book.price})`
                        : ""
                    }`}
                  </Typography>
                </CardContent>
                <CardActions>
                  {isSelected && (
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => handleDecrementQuantity(book)}
                        disabled={quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e, book)}
                        inputProps={{ min: 1 }}
                        sx={{ width: 50, textAlign: "center" }}
                      />
                      <IconButton onClick={() => handleIncrementQuantity(book)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    color={isSelected ? "secondary" : "primary"}
                    onClick={() => handleSelectBook(book)}
                    fullWidth
                  >
                    {isSelected ? "移除" : "加入购物车"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box display="flex" justifyContent="center" marginTop={2}>
        <Pagination
          count={Math.ceil(books.length / booksPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <BookDetail book={selectedBook} />
        </Box>
      </Modal>
      {showScrollTopButton && (
        <Fab
          color="primary"
          size="small"
          onClick={handleScrollToTop}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <ArrowUpwardIcon />
        </Fab>
      )}
    </Container>
  );
};

export default SelectProduct;
