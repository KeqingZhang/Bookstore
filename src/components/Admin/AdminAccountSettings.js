import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const AdminAccountSettings = () => {
  // const [accountId] = useState(""); // 示例账户ID，你可以根据需要修改获取
  const [adminNickname, setAdminNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchAdminInfo(); // 组件加载时获取管理员信息
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const response = await axios.get(`${BOOKSTORE_BACKEND_URL}/admin/info`);
      const adminInfo = response.data; // 假设返回的数据格式包含了管理员的所有信息
      setAdminNickname(adminInfo.admin_nickname);
      setEmail(adminInfo.email);
      setOfficeAddress(adminInfo.office_address);
      setCompany(adminInfo.company);
      setPosition(adminInfo.position);
    } catch (error) {
      console.error("Error fetching admin information:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      alert("密码和确认密码不一致");
      return;
    }

    try {
      const updateData = { password };
      const response = await axios.post(
        `${BOOKSTORE_BACKEND_URL}/admin/update_password`,
        updateData
      );
      console.log(response);
      setSnackbarMessage("密码修改成功");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating password:", error);
      setSnackbarMessage("密码修改失败");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const updateData = {
        admin_nickname: adminNickname,
        email,
        office_address: officeAddress,
        company,
        position,
      };
      const response = await axios.post(
        `${BOOKSTORE_BACKEND_URL}/admin/update`,
        updateData
      );
      console.log(response);
      setSnackbarMessage("信息更新成功");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating admin information:", error);
      setSnackbarMessage("信息更新失败");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box>
        <Typography component="h1" variant="h5">
          管理员 {adminNickname} 信息设置
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{ mt: 3 }}
        >
          {/* 更新管理员信息部分 */}
          <Typography component="h2" variant="h6">
            更新信息
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="adminNickname"
            label="昵称"
            id="adminNickname"
            value={adminNickname}
            onChange={(e) => setAdminNickname(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            name="email"
            label="邮箱"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            name="officeAddress"
            label="办公地址"
            id="officeAddress"
            value={officeAddress}
            onChange={(e) => setOfficeAddress(e.target.value)}
          />

          <Button
            type="button" // 防止表单提交
            fullWidth
            variant="contained"
            onClick={handleUpdateInfo}
            sx={{ mt: 2 }}
          >
            更新信息
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{ mt: 5 }}
        >
          {/* 修改密码部分 */}
          <Typography component="h2" variant="h6">
            修改密码
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="新密码"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="确认新密码"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="button" // 防止表单提交
            fullWidth
            variant="contained"
            onClick={handlePasswordChange}
            sx={{ mt: 3 }}
          >
            修改密码
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminAccountSettings;
