import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const BookList = ({ storeId }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPrices, setNewPrices] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${BOOKSTORE_BACKEND_URL}/merchant-books`
        );
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [storeId]);

  const handleRemoveFromShelf = async (bookId) => {
    try {
      await axios.delete(`${BOOKSTORE_BACKEND_URL}/books_remove/${bookId}`);
      const updatedBooks = books.filter((book) => book.book_id !== bookId);
      setBooks(updatedBooks);
    } catch (error) {
      console.error("Error removing book:", error);
    }
  };

  const handlePriceChange = (bookId, newPrice) => {
    setNewPrices((prevPrices) => ({
      ...prevPrices,
      [bookId]: newPrice,
    }));
  };

  const handlePriceAdjustment = async (bookId) => {
    const newPrice = newPrices[bookId];
    if (!newPrice) {
      alert("请输入新的价格");
      return;
    }

    const confirmUpdate = window.confirm("确定要更改价格吗？");
    if (!confirmUpdate) {
      return;
    }

    console.log(bookId, newPrice);
    try {
      await axios.patch(`${BOOKSTORE_BACKEND_URL}/books_price/${bookId}`, {
        price: newPrice,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error adjusting price:", error);
    }
  };

  const handleOpenModal = (book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        商店的上架书籍
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {loading ? (
          <>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rectangular" height={118} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rectangular" height={118} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Grid>
          </>
        ) : (
          books.map((book) => (
            <Grid item key={book.book_id} xs={12} sm={6}>
              <Card variant="outlined" sx={{ maxWidth: 480 }}>
                <Box sx={{ p: 2 }} onClick={() => handleOpenModal(book)}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography gutterBottom variant="h5" component="div">
                      {book.book_name}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      ${book.price}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" variant="body2">
                    {book.description}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography gutterBottom variant="body2">
                      库存: {book.stock}
                    </Typography>
                    <Typography gutterBottom variant="body2">
                      分类: {book.category}
                    </Typography>
                  </Stack>
                  <TextField
                    label="新价格"
                    variant="outlined"
                    size="small"
                    value={newPrices[book.book_id] || ""}
                    onChange={(e) =>
                      handlePriceChange(book.book_id, e.target.value)
                    }
                    sx={{ mt: 2, width: "100%" }}
                  />
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handlePriceAdjustment(book.book_id)}
                      sx={{ flex: 1 }}
                    >
                      修改价格
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveFromShelf(book.book_id)}
                      sx={{ flex: 1 }}
                    >
                      下架
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Modal
        open={!!selectedBook}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedBook && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {selectedBook.book_name}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {selectedBook.description}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                价格: ${selectedBook.price}
              </Typography>
              <Typography sx={{ mt: 2 }}>库存: {selectedBook.stock}</Typography>
              <Typography sx={{ mt: 2 }}>
                分类: {selectedBook.category}
              </Typography>
              <Button
                onClick={handleCloseModal}
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                关闭
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BookList;
