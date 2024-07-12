import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/system";

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    marginBottom: theme.spacing(2),
    backgroundColor: "#3f51b5", // 修改导航栏颜色
  },
  tab: {
    fontWeight: "bold",
    color: "#ffffff", // 修改标签文字颜色
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    minWidth: 120,
    marginTop: theme.spacing(2),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  gridItem: {
    display: "flex",
    alignItems: "center",
  },
  cardActions: {
    display: "flex",
    justifyContent: "center",
  },
}));

const OrderList = ({ storeId }) => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("全部");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let url = `http://101.201.67.182:5000/merchant/orders`;
        if (selectedStatus !== "全部") {
          url += `?status=${selectedStatus}`;
        }
        const response = await axios.get(url);
        console.log(response);
        console.log(response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = (orderId, newStatus) => {
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      [orderId]: newStatus,
    }));
  };

  const handleStatusUpdate = async (orderId) => {
    try {
      const newStatus = statuses[orderId];
      await axios.patch(`http://101.201.67.182:5000/orders`, {
        transaction_status: newStatus,
        orderId: orderId,
      });
      setOrders((prevOrders) =>
        prevOrders.filter((order) =>
          selectedStatus === "全部"
            ? true
            : order.order_id !== orderId || newStatus === selectedStatus
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedStatus(newValue);
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h5" gutterBottom>
        商店 {storeId} 的订单记录
      </Typography>
      <AppBar position="static" className={classes.appBar}>
        <Tabs value={selectedStatus} onChange={handleTabChange} centered>
          <Tab
            value="全部"
            label="全部订单"
            className={classes.tab}
            sx={{ minWidth: 120 }}
          />
          <Tab
            value="未发货"
            label="未发货订单"
            className={classes.tab}
            sx={{ minWidth: 120 }}
          />
          <Tab
            value="正在配送"
            label="正在配送订单"
            className={classes.tab}
            sx={{ minWidth: 120 }}
          />
          <Tab
            value="已送达"
            label="已送达订单"
            className={classes.tab}
            sx={{ minWidth: 120 }}
          />
        </Tabs>
      </AppBar>
      <Grid container spacing={2}>
        {loading ? (
          <>
            {[1, 2].map((_, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Skeleton variant="rectangular" height={118} />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Grid>
            ))}
          </>
        ) : (
          orders.map((order) => (
            <Grid item key={order.order_id} xs={12} sm={6}>
              <Card className={classes.card}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        订单号: {order.order_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        商家名称: {order.merchant_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        用户名称: {order.nickname}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        书本名称: {order.book_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        交易书目: {order.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        交易金额: {order.total_amount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        交易日期: {order.transaction_date}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        送货地址: {order.delivery_address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.gridItem}>
                      <Typography variant="body2">
                        交易状态: {order.transaction_status}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                      <FormControl className={classes.formControl}>
                        <InputLabel>更改交易状态</InputLabel>
                        <Select
                          value={
                            statuses[order.order_id] || order.transaction_status
                          }
                          onChange={(e) =>
                            handleStatusChange(order.order_id, e.target.value)
                          }
                        >
                          <MenuItem value="未发货">未发货</MenuItem>
                          <MenuItem value="正在配送">正在配送</MenuItem>
                          <MenuItem value="已送达">已送达</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions className={classes.cardActions}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStatusUpdate(order.order_id)}
                  >
                    确认更改
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default OrderList;
