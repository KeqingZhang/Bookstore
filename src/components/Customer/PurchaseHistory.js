import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import axios from "axios";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const PurchaseHistory = () => {
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [bookName, setBookName] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BOOKSTORE_BACKEND_URL}/customer/orders`,
        {
          params: {
            book_name: bookName,
            merchant_name: merchantName,
            start_date: startDate,
            end_date: endDate,
          },
        }
      );
      setFilteredHistory(response.data);
    } catch (error) {
      console.error("获取订单数据出错:", error);
    }
  }, [bookName, merchantName, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          mt: 4,
          mb: 4,
          padding: 3,
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#e0e0e0" : "#fff",
          color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#000"),
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          历史消费记录
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <TextField
            label="搜索书籍名称"
            variant="outlined"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            sx={{ mr: 2 }}
          />
          <TextField
            label="搜索商家名称"
            variant="outlined"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            sx={{ mr: 2 }}
          />
          <TextField
            label="开始日期"
            variant="outlined"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mr: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="结束日期"
            variant="outlined"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ mr: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" color="primary" onClick={fetchOrders}>
            搜索
          </Button>
        </Box>
        <Grid container spacing={2}>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">
                    <strong>书名:</strong> {record.book_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>交易日期:</strong> {record.transaction_date}
                  </Typography>
                  <Typography variant="body1">
                    <strong>交易ID:</strong> {record.order_id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>商家名称:</strong> {record.merchant_name}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" sx={{ mt: 4 }}>
              没有找到相关记录。
            </Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default PurchaseHistory;
