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

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const ModifyUserInfo = () => {
  const [username, setUsername] = useState("");
  const [subusername, setSubusername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [readingPreferences, setReadingPreferences] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    axios
      .get(`${BOOKSTORE_BACKEND_URL}/get-current-user`)
      .then((response) => {
        const userData = response.data;
        setUsername(userData.username);
        setSubusername(userData.subusername);
        setEmail(userData.email);
        setAddress(userData.address);
        setReadingPreferences(userData.bookPreferences);
        setBirthday(userData.birthday);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const handleRefresh = () => {
    axios
      .get(`${BOOKSTORE_BACKEND_URL}/get-current-user`)
      .then((response) => {
        const userData = response.data;
        setUsername(userData.username);
        setSubusername(userData.subusername);
        setEmail(userData.email);
        setAddress(userData.address);
        setReadingPreferences(userData.bookPreferences);
        setBirthday(userData.birthday);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const handleSubmitUserInfo = (event) => {
    event.preventDefault();
    const updatedUserInfo = {
      username,
      subusername,
      email,
      address,
      bookPreferences: readingPreferences,
      birthday,
    };
    axios
      .post(`${BOOKSTORE_BACKEND_URL}/update-user-info`, updatedUserInfo)
      .then((response) => {
        console.log("User info updated successfully:", response.data);
        setOpenDialog(true);
      })
      .catch((error) => {
        console.error("Error updating user info:", error);
      });
  };

  const handleSubmitPassword = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("密码不匹配，请重新输入");
      return;
    }
    const updatedPassword = {
      password,
    };
    axios
      .post(`${BOOKSTORE_BACKEND_URL}/update-password`, updatedPassword)
      .then((response) => {
        console.log("Password updated successfully:", response.data);
        setOpenDialog(true);
      })
      .catch((error) => {
        console.error("Error updating password:", error);
      });
  };

  const handleConfirm = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ width: "60%", margin: "0 auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        修改用户信息
      </Typography>

      {/* 修改用户信息表单 */}
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "#fff",
          mb: 4,
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          修改用户基本信息
        </Typography>
        <form onSubmit={handleSubmitUserInfo}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="用户名"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="昵称"
                variant="outlined"
                value={subusername}
                onChange={(e) => setSubusername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="邮箱"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="读书偏好"
                variant="outlined"
                value={readingPreferences}
                onChange={(e) => setReadingPreferences(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="生日"
                variant="outlined"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
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
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* 修改密码表单 */}
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "#fff",
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          修改密码
        </Typography>
        <form onSubmit={handleSubmitPassword}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="新密码"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="确认新密码"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    更新密码
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* 确认更新信息的弹窗 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>确认更新信息</DialogTitle>
        <DialogContent>
          <DialogContentText>您确定要更新用户信息吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} color="primary">
            确认更改
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModifyUserInfo;
