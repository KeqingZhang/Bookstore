import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const OrderList = () => {
  const [orders, setOrders] = React.useState([]);
  const [searchUser, setSearchUser] = React.useState("");
  const [searchMerchant, setSearchMerchant] = React.useState("");
  const [searchDate, setSearchDate] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const fetchOrders = React.useCallback(async () => {
    try {
      const response = await axios.get(
        `${BOOKSTORE_BACKEND_URL}/admin/orders`,
        {
          params: {
            user_name: searchUser,
            merchant_name: searchMerchant,
            transaction_date: searchDate,
          },
        }
      );
      const filteredOrders = response.data
        .filter((order) => {
          if (statusFilter === "") return true;
          return order.transaction_status === statusFilter;
        })
        .sort(
          (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
        );
      setOrders(filteredOrders);
      // console.log(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [searchUser, searchMerchant, searchDate, statusFilter]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders, statusFilter]);

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${BOOKSTORE_BACKEND_URL}/admin/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log(`${text} copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        订单列表
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="交易用户"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="交易商户"
            value={searchMerchant}
            onChange={(e) => setSearchMerchant(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="交易时间"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">订单状态</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="订单状态"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="未发货">未发货</MenuItem>
              <MenuItem value="正在配送">正在配送</MenuItem>
              <MenuItem value="已送达">已送达</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} container justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ width: "40%" }}
          >
            搜索
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>订单ID</StyledTableCell>
              <StyledTableCell align="right">商户名</StyledTableCell>
              <StyledTableCell align="right">用户名</StyledTableCell>
              <StyledTableCell align="right">书名</StyledTableCell>
              <StyledTableCell align="right">数量</StyledTableCell>
              <StyledTableCell align="right">总金额</StyledTableCell>
              <StyledTableCell align="right">交易日期</StyledTableCell>
              <StyledTableCell align="right">送货地址</StyledTableCell>
              <StyledTableCell align="right">交易状态</StyledTableCell>
              <StyledTableCell align="right">操作</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <StyledTableRow key={order.order_id}>
                <StyledTableCell component="th" scope="row">
                  {order.order_id}
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  onClick={() => copyToClipboard(order.merchant_name)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {order.merchant_name}
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  onClick={() => copyToClipboard(order.user_name)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {order.customer_id}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.book_name}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.quantity}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.total_amount}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.transaction_date}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.delivery_address}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {order.transaction_status}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteOrder(order.order_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderList;
