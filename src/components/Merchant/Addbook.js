import React, { useState } from "react";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import axios from "axios";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const AddBook = () => {
  const [bookName, setBookName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create a new FormData object
    const formData = new FormData();
    formData.append("book_name", bookName);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("author", author);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("image", imageFile);

    try {
      const response = await axios.post(
        `${BOOKSTORE_BACKEND_URL}/add-book`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Book added successfully:", response.data);

      // Clear the form
      setBookName("");
      setPrice("");
      setDescription("");
      setAuthor("");
      setImageFile(null);
      setStock("");
      setCategory("");
    } catch (error) {
      console.error("There was an error adding the book:", error);
    }
  };

  return (
    <Box
      sx={{
        width: "60%",
        margin: "0 auto",
        textAlign: "center",
        mt: 4,
        mb: 4,
        padding: 3,
        border: "1px solid #ccc",
        borderRadius: 8,
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h4" gutterBottom>
        添加新书籍
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="书名"
              variant="outlined"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="价格"
              variant="outlined"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="描述"
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="作者"
              variant="outlined"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <input
              accept="image/*"
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="库存"
              variant="outlined"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="类别"
              variant="outlined"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              添加书籍
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddBook;
