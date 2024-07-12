import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";
import {
  Grid,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Container,
} from "@mui/material";

const Register = () => {
  const [userType, setUserType] = useState("customer");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [username, setUsername] = useState("");
  const [subusername, setSubusername] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [bookPreferences, setBookPreferences] = useState("");
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [salesCategory, setSalesCategory] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      let postData = {};
      if (userType === "customer") {
        postData = {
          username,
          subusername,
          password,
          email,
          defaultAddress,
          birthday,
          bookPreferences,
        };
      } else if (userType === "merchant") {
        postData = {
          storeId,
          storeName,
          storePassword,
          storeAddress,
          salesCategory,
          establishmentDate,
          phone,
        };
      } else if (userType === "admin") {
        postData = {
          adminId: id,
          nickname: nickname,
          password: password,
          email: email,
          office_address: officeAddress,
        };
      }

      const response = await axios.post(
        `http://101.201.67.182:5000/${userType}-register`,
        postData
      );

      console.log("注册成功:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("注册失败:", error);
    }
  };

  const renderFormFields = () => {
    switch (userType) {
      case "customer":
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                label="用户名"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="subusername"
                label="昵称"
                name="subusername"
                autoComplete="subusername"
                value={subusername}
                onChange={(e) => setSubusername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="邮箱"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="defaultAddress"
                label="默认收货地址"
                id="defaultAddress"
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                id="birthday"
                label="生日"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="bookPreferences"
                label="读书偏好"
                id="bookPreferences"
                value={bookPreferences}
                onChange={(e) => setBookPreferences(e.target.value)}
              />
            </Grid>
          </>
        );
      case "merchant":
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="storeId"
                label="商店ID"
                name="storeId"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="storeName"
                label="商店名称"
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="storePassword"
                label="商店密码"
                type="password"
                id="storePassword"
                autoComplete="new-password"
                value={storePassword}
                onChange={(e) => setStorePassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="storeAddress"
                label="商店地址"
                id="storeAddress"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="salesCategory"
                label="销售类别"
                id="salesCategory"
                value={salesCategory}
                onChange={(e) => setSalesCategory(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                id="establishmentDate"
                label="建店时间"
                value={establishmentDate}
                onChange={(e) => setEstablishmentDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phone"
                label="电话"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
          </>
        );
      case "admin":
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="id"
                label="管理员用户名"
                name="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="nickname"
                label="管理员昵称"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="管理员密码"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="管理员邮箱"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="officeAddress"
                label="办公地址"
                id="officeAddress"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
              />
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        backgroundImage: "/public/homepage/background2.png",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          mt: 4,
          mb: 4,
          padding: 3,
          borderRadius: 8,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typography component="h1" variant="h5">
          欢迎注册Snitch商城
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="用户类型"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                helperText="请选择用户类型"
              >
                <MenuItem value="customer">用户注册</MenuItem>
                <MenuItem value="admin">管理员注册</MenuItem>
                <MenuItem value="merchant">商家注册</MenuItem>
              </TextField>
            </Grid>
            {renderFormFields()}
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            注册
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
