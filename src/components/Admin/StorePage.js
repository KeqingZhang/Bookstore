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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
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

const StoreList = () => {
  const [stores, setStores] = React.useState([]);
  const [searchStore, setSearchStore] = React.useState("");
  const [warningDialogOpen, setWarningDialogOpen] = React.useState(false);
  const [warningContent, setWarningContent] = React.useState("");
  const [currentStore, setCurrentStore] = React.useState(null);

  // React.useEffect(() => {
  //   fetchStores();
  // }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(
        "http://101.201.67.182:5000/admin/stores",
        {
          params: {
            store_name: searchStore,
          },
        }
      );
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleDeleteStore = async (storeId) => {
    try {
      const response = await axios.delete(
        `http://101.201.67.182:5000/admin/stores/${storeId}`
      );
      console.log(response.data.message); // 输出成功信息
      fetchStores(); // 删除成功后，刷新商店列表
    } catch (error) {
      console.error("Error deleting store:", error);
    }
  };

  const handleWarningStore = (store) => {
    setCurrentStore(store);
    setWarningDialogOpen(true);
  };

  const handleWarningSubmit = async () => {
    if (currentStore) {
      try {
        const response = await axios.post(
          `http://101.201.67.182:5000/admin/warn_store`,
          {
            store_id: currentStore.store_id,
            warning_content: warningContent,
          }
        );
        console.log(response.data.message); // 输出成功信息
        setWarningDialogOpen(false);
        setWarningContent("");
      } catch (error) {
        console.error("Error warning store:", error);
      }
    }
  };

  const handleSearch = () => {
    fetchStores();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        商店列表
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="商店名称"
            value={searchStore}
            onChange={(e) => setSearchStore(e.target.value)}
          />
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
              <StyledTableCell>商店ID</StyledTableCell>
              <StyledTableCell align="right">商店名称</StyledTableCell>
              <StyledTableCell align="right">商店地址</StyledTableCell>
              <StyledTableCell align="right">操作</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <StyledTableRow key={store.store_id}>
                <StyledTableCell component="th" scope="row">
                  {store.store_id}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {store.store_name}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {store.store_address}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton
                    edge="end"
                    aria-label="warning"
                    onClick={() => handleWarningStore(store)}
                  >
                    <WarningIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteStore(store.store_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={warningDialogOpen}
        onClose={() => setWarningDialogOpen(false)}
      >
        <DialogTitle>警告商店</DialogTitle>
        <DialogContent>
          <DialogContentText>请输入对商店的警告内容：</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="警告内容"
            fullWidth
            value={warningContent}
            onChange={(e) => setWarningContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialogOpen(false)}>取消</Button>
          <Button onClick={handleWarningSubmit}>提交</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreList;
