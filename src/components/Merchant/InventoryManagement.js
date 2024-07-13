import * as React from "react";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { styled } from "@mui/system";
import axios from "axios";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const Container = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "80%",
  margin: "0 auto",
  flexDirection: "column",
});

const Item = styled(Grid)({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

const InventoryManagement = ({ storeId }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newInventories, setNewInventories] = useState({});

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

  useEffect(() => {
    fetchBooks();
  }, [storeId]);

  const handleInventoryChange = (bookId, newInventory) => {
    setNewInventories((prevInventories) => ({
      ...prevInventories,
      [bookId]: newInventory,
    }));
  };

  const handleInventoryUpdate = async (bookId) => {
    try {
      const newInventory = newInventories[bookId];
      await axios.patch(`${BOOKSTORE_BACKEND_URL}/books_invent`, {
        inventory: newInventory,
        bookId: bookId,
      });
      fetchBooks(); // 成功更新库存后，重新获取书籍数据

      // 清除相应的输入框内容
      setNewInventories((prevInventories) => ({
        ...prevInventories,
        [bookId]: "",
      }));
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        商店 {storeId} 的书本库存管理
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {loading ? (
          <Typography>正在加载...</Typography>
        ) : (
          books.map((book) => (
            <Item key={book.book_id} item xs={12} sm={6}>
              <Card variant="outlined" sx={{ maxWidth: 360, padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {book.book_name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  库存: {book.stock}
                </Typography>
                <TextField
                  type="number"
                  label="修改库存量"
                  value={newInventories[book.book_id] || ""}
                  onChange={(e) =>
                    handleInventoryChange(book.book_id, e.target.value)
                  }
                  fullWidth
                  sx={{ marginBottom: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleInventoryUpdate(book.book_id)}
                  fullWidth
                >
                  确认更改
                </Button>
              </Card>
            </Item>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default InventoryManagement;
