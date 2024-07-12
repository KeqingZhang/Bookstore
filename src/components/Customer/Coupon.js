import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  Modal,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  Grid,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";

const darkTheme = createTheme({ palette: { mode: "dark" } });
const lightTheme = createTheme({ palette: { mode: "light" } });

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: "60px",
  padding: theme.spacing(2),
}));

const CouponModal = ({ coupons, open, onClose }) => {
  if (!coupons || coupons.length === 0) {
    return null;
  }

  const storeId = coupons[0].store_id;
  const store_name = coupons[0].store_name;
  const totalCoupons = coupons.length;

  return (
    <Modal open={open} onClose={onClose}>
      <Card
        sx={{
          maxWidth: 600, // 调整最大宽度
          m: 2,
          p: 2,
          margin: "auto",
          top: "50%",
          transform: "translateY(-50%)",
          position: "relative",
          overflow: "auto",
          maxHeight: "80vh",
        }}
      >
        <CardHeader
          avatar={
            <Avatar aria-label="coupon" sx={{ bgcolor: "primary.main" }}>
              {storeId ? storeId.toString()[0].toUpperCase() : ""}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Typography variant="h5">商店: {store_name}</Typography> // 调整标题字号
          }
          subheader={
            <Typography variant="h6">总剩余数量: {totalCoupons}</Typography> // 调整副标题字号
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            {coupons.map((coupon, index) => (
              <Grid item xs={12} key={coupon.id}>
                <ThemeProvider theme={index % 2 === 0 ? lightTheme : darkTheme}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.default",
                      display: "grid",
                      gap: 2,
                    }}
                  >
                    <Item>
                      <Typography variant="body1">
                        过期日期: {coupon.expiration_date}
                      </Typography>
                    </Item>
                    <Item>
                      <Typography variant="body1">
                        折扣力度: {coupon.discount_value || "N/A"}
                      </Typography>
                    </Item>
                    <Item>
                      <Typography variant="body1">
                        活动: {coupon.promotion || "N/A"}
                      </Typography>
                    </Item>
                    <Item>
                      <Typography variant="body1">
                        活动简介: {coupon.promotion_description || "N/A"}
                      </Typography>
                    </Item>
                  </Box>
                </ThemeProvider>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Modal>
  );
};

const CouponDisplay = () => {
  const [coupons, setCoupons] = useState({});
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCoupons, setFilteredCoupons] = useState({});
  const [selectedCoupons, setSelectedCoupons] = useState(null);

  useEffect(() => {
    axios
      .get(`http://101.201.67.182:5000/coupons`)
      .then((response) => {
        setCoupons(response.data);
        setFilteredCoupons(response.data);
        console.log(filteredCoupons);
      })
      .catch((error) => {
        console.error("Error fetching coupons:", error);
      });
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredCoupons(coupons);
    } else {
      const filtered = {};
      for (const [storeId, couponData] of Object.entries(coupons)) {
        if (storeId.toLowerCase().includes(searchQuery.toLowerCase())) {
          filtered[storeId] = couponData;
        }
      }
      setFilteredCoupons(filtered);
    }
  };

  const handleOpenModal = (coupons) => {
    setSelectedCoupons(coupons);
  };

  const handleCloseModal = () => {
    setSelectedCoupons(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        用户 {username} 的优惠券
      </Typography>
      <Box sx={{ display: "flex", mb: 2, width: "60%" }}>
        <TextField
          label="搜索商店"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          onClick={handleSearch}
        >
          搜索
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", width: "80%" }}>
        {Object.keys(filteredCoupons).map((storeId) => (
          <Paper
            key={storeId}
            sx={{ mb: 2, p: 2, width: "45%", margin: "2.5%" }}
            onClick={() => handleOpenModal(filteredCoupons[storeId].coupons)}
          >
            <Typography variant="h6">
              商店: {filteredCoupons[storeId].coupons[0].store_name}
            </Typography>
            <Typography>
              最早过期日期: {filteredCoupons[storeId].earliest_expiration_date}
            </Typography>
            <Typography>剩余数量：{filteredCoupons[storeId].count}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Paper>
        ))}
      </Box>
      {selectedCoupons && (
        <CouponModal
          coupons={selectedCoupons}
          open={!!selectedCoupons}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};

export default CouponDisplay;
