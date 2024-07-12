import React, { useState, useEffect } from "react";

import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";

const ModifyMerchantInfo = () => {
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [salesCategory, setSalesCategory] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [phone, setPhone] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fetch merchant data from backend on component mount
  useEffect(() => {
    axios
      .get("http://101.201.67.182:5000/get-current-merchant")
      .then((response) => {
        const merchantData = response.data;
        setStoreId(merchantData.store_id);
        setStoreName(merchantData.store_name);
        setStoreAddress(merchantData.store_address);
        setSalesCategory(merchantData.sales_category);
        setEstablishmentDate(merchantData.establishment_date);
        setPhone(merchantData.phone);
      })
      .catch((error) => {
        console.error("Error fetching merchant data:", error);
      });
  }, []);

  const handleRefresh = () => {
    axios
      .get("http://101.201.67.182:5000/get-current-merchant")
      .then((response) => {
        const merchantData = response.data;
        setStoreId(merchantData.store_id);
        setStoreName(merchantData.store_name);
        setStoreAddress(merchantData.store_address);
        setSalesCategory(merchantData.sales_category);
        setEstablishmentDate(merchantData.establishment_date);
        setPhone(merchantData.phone);
      })
      .catch((error) => {
        console.error("Error fetching merchant data:", error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedMerchantInfo = {
      store_name: storeName,
      store_password: storePassword,
      store_address: storeAddress,
      sales_category: salesCategory,
      phone: phone,
    };
    axios
      .patch(
        "http://101.201.67.182:5000/update-merchant-info",
        updatedMerchantInfo
      )
      .then((response) => {
        console.log("商户信息更新成功:", response.data);
        setOpenDialog(true);
      })
      .catch((error) => {
        console.error("更新商户信息时发生错误:", error);
      });
  };

  const handleConfirm = () => {
    setOpenDialog(false);
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError("密码不匹配");
      return;
    }
    // Call API to update password
    const updatedPassword = {
      store_password: newPassword,
    };
    axios
      .patch(
        "http://101.201.67.182:5000/update-merchant-password",
        updatedPassword
      )
      .then((response) => {
        console.log("密码更新成功:", response.data);
        setOpenPasswordDialog(false);
        setOpenDialog(true); // Open confirmation dialog after password update
      })
      .catch((error) => {
        console.error("更新密码时发生错误:", error);
      });
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
        修改商户信息
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="商户ID"
              variant="outlined"
              value={storeId}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="商户名称"
              variant="outlined"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PasswordField
              value={storePassword}
              onChange={(e) => setStorePassword(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="地址"
              variant="outlined"
              multiline
              rows={1}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="销售类别"
              variant="outlined"
              value={salesCategory}
              onChange={(e) => setSalesCategory(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="成立日期"
              variant="outlined"
              type="date"
              value={establishmentDate}
              onChange={(e) => setEstablishmentDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="联系电话"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  刷新
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  更新信息
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleOpenPasswordDialog}
                >
                  修改密码
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>

      {/* 确认更新信息的弹窗 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>确认更新信息</DialogTitle>
        <DialogContent>
          <DialogContentText>您确定要更新商户信息吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} color="primary">
            确认更改
          </Button>
        </DialogActions>
      </Dialog>

      {/* 修改密码对话框 */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="新密码"
            variant="outlined"
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            required
            error={!!passwordError}
            helperText={passwordError}
          />
          <TextField
            fullWidth
            label="确认新密码"
            variant="outlined"
            type="password"
            value={confirmNewPassword}
            onChange={handleConfirmPasswordChange}
            required
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleUpdatePassword} color="primary">
            确认修改
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 密码字段组件
const PasswordField = ({ value, onChange, required }) => {
  const [password, setPassword] = useState(value);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("密码不匹配");
    } else {
      setPasswordError("");
      onChange(e);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password !== newConfirmPassword) {
      setPasswordError("密码不匹配");
    } else {
      setPasswordError("");
      onChange(e);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        label="密码"
        variant="outlined"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        required={required}
        error={!!passwordError}
        helperText={passwordError}
      />
      <TextField
        fullWidth
        label="确认密码"
        variant="outlined"
        type="password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        required={required}
        error={!!passwordError}
        helperText={passwordError}
      />
    </>
  );
};

export default ModifyMerchantInfo;
