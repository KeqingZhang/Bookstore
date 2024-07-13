import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";

const BOOKSTORE_BACKEND_URL = process.env.REACT_APP_BOOKSTORE_BACKEND_URL;

const MerchantComments = () => {
  const [allComments, setAllComments] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // 未读评论数量
  const [tabValue, setTabValue] = useState(0); // 默认选中未读评论

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${BOOKSTORE_BACKEND_URL}/merchant_comments`
      );
      if (response.data) {
        const comments = response.data;
        const unread = comments.filter((comment) => !comment.state);
        setUnreadCount(unread.length); // 设置未读评论数量
        setAllComments(comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const markAsRead = async (commentId) => {
    try {
      await axios.post(`${BOOKSTORE_BACKEND_URL}/merchant_comments/read`, {
        comment_id: commentId,
      });
      fetchComments();
    } catch (error) {
      console.error("Error marking comment as read:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 根据选项卡值过滤评论
  const filteredComments = allComments.filter(
    (comment) =>
      (tabValue === 0 && !comment.state) || (tabValue === 1 && comment.state)
  );

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3 }}>
        管理员评论
      </Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 3 }}
      >
        <Tab label={`未读评论 (${unreadCount})`} />
        <Tab label="已读评论" />
      </Tabs>
      <Grid container spacing={3}>
        {filteredComments.map((comment) => (
          <Grid item xs={12} key={comment.record_id}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  收到来自管理员 {comment.admin_id} 的评论
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  内容: {comment.context}
                </Typography>
                <Typography variant="body2">时间: {comment.time}</Typography>
                {!comment.state && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => markAsRead(comment.record_id)}
                    sx={{ mt: 2 }}
                  >
                    标记为已读
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MerchantComments;
