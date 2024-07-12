import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

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

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [warningContents, setWarningContents] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // 当前页数
  const [usersPerPage] = useState(20); // 每页显示的用户数

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://101.201.67.182:5000/admin/users",
        {
          params: {
            user_name: searchUsername,
            page: currentPage, // 添加参数以获取当前页数据
            limit: usersPerPage, // 每页的用户数限制
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [searchUsername, currentPage, usersPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://101.201.67.182:5000/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleWarnUser = async (userId) => {
    try {
      await axios.post("http://101.201.67.182:5000/admin/warn_user", {
        user_id: userId,
        warning_content: warningContents[userId] || "",
      });
      setWarningContents((prev) => ({ ...prev, [userId]: "" })); // Clear warning content after sending
    } catch (error) {
      console.error("Error warning user:", error);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleWarningContentChange = (userId, content) => {
    setWarningContents((prev) => ({ ...prev, [userId]: content }));
  };

  return (
    <Box maxWidth="90%">
      <TextField
        label="Search by Username"
        variant="outlined"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSearch}
        sx={{ marginRight: 2 }}
      >
        Search
      </Button>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>User ID</StyledTableCell>
              <StyledTableCell align="center">用户名</StyledTableCell>
              <StyledTableCell align="center">邮箱</StyledTableCell>
              <StyledTableCell align="center">地址</StyledTableCell>
              <StyledTableCell align="center">生日</StyledTableCell>
              <StyledTableCell align="center">分类</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user.user_id}>
                <StyledTableCell component="th" scope="row">
                  {user.user_id}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {user.user_name}
                </StyledTableCell>
                <StyledTableCell align="right">{user.email}</StyledTableCell>
                <StyledTableCell align="right">{user.address}</StyledTableCell>
                <StyledTableCell align="right">{user.birthday}</StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteUser(user.user_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <TextField
                    label="Warning Content"
                    variant="outlined"
                    size="small"
                    value={warningContents[user.user_id] || ""}
                    onChange={(e) =>
                      handleWarningContentChange(user.user_id, e.target.value)
                    }
                    sx={{ marginTop: 1, width: 200 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleWarnUser(user.user_id)}
                    sx={{ marginTop: 1 }}
                  >
                    警告客户
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
