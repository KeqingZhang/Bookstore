import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Card,
  CardActions,
  CardContent,
  TextField,
  Button,
} from "@mui/material";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const Orders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [bookName, setBookName] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // useEffect(() => {
  //   fetchOrders();
  // }, []);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    const status = ["全部", "未发货", "正在配送", "已送达"][newValue];
    fetchOrders(status);
  };

  const fetchOrders = async (status = "全部") => {
    try {
      const response = await axios.get(
        `${BOOKSTORE_BACKEND_URL}/customer/orders`,
        {
          params: {
            user_id: userId,
            book_name: bookName,
            merchant_name: merchantName,
            start_date: startDate,
            end_date: endDate,
            status: status,
          },
        }
      );
      setOrders(response.data);
    } catch (error) {
      console.error("获取订单数据出错:", error);
    }
  };

  const renderOrders = (status) => {
    return orders
      .filter(
        (order) => order.transaction_status === status || status === "全部"
      )
      .map((order) => (
        <Card
          variant="outlined"
          sx={{ width: "80%", margin: "0 auto", mb: 3 }}
          key={order.order_id}
        >
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {order.book_name}
              </Typography>
              <CardActions>
                <Button size="big">商家: {order.merchant_name}</Button>
              </CardActions>
              <Typography>购买数量: {order.quantity}</Typography>
              <Typography>消费金额: ${order.total_amount}</Typography>
              <Typography>当前订单状态: {order.transaction_status}</Typography>
              <Typography>下单日期: {order.transaction_date}</Typography>
            </CardContent>
          </Card>
          <Divider />
        </Card>
      ));
  };

  const handleSearch = () => {
    fetchOrders(["全部", "未发货", "正在配送", "已送达"][selectedTab]);
  };

  return (
    <Container sx={{ width: "80%", margin: "0 auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <TextField
          label="书名"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          sx={{ mr: 2 }}
        />
        <TextField
          label="商家"
          value={merchantName}
          onChange={(e) => setMerchantName(e.target.value)}
          sx={{ mr: 2 }}
        />
        <TextField
          label="开始日期"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="结束日期"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          搜索
        </Button>
      </Box>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        centered
        sx={{ fontSize: "2rem", mt: 3 }}
      >
        <Tab label="全部" />
        <Tab label="未发货" />
        <Tab label="正在配送" />
        <Tab label="已送达" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderOrders("全部")}
        {selectedTab === 1 && renderOrders("未发货")}
        {selectedTab === 2 && renderOrders("正在配送")}
        {selectedTab === 3 && renderOrders("已送达")}
      </Box>
    </Container>
  );
};

export default Orders;
