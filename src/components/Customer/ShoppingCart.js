import React, { useState } from "react";
import { Box, Stepper, Step, StepLabel, Modal, Button } from "@mui/material";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import SelectProduct from "./shoppingcart/SelectProduct";
import ShoppingBasket from "./shoppingcart/ShoppingBasket";
import Checkout from "./shoppingcart/Checkout";
import Complete from "./shoppingcart/Complete";
import BookDetail from "./shoppingcart/BookDetail";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const steps = [
  { label: "选择商品", icon: <ShoppingCartIcon /> },
  { label: "购物车", icon: <ShoppingCartIcon /> },
  { label: "结账", icon: <CreditCardIcon /> },
  { label: "完成", icon: <AssignmentTurnedInIcon /> },
];

const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();

  const addToCart = (book) => {
    setCart([...cart, book]);
  };

  const removeFromCart = (book) => {
    setCart(cart.filter((item) => item !== book));
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const getCurrentStep = () => {
    switch (location.pathname) {
      case "/customer-dashboard/shopping-cart/select-product":
        return 0;
      case "/customer-dashboard/shopping-cart/shopping-basket":
        return 1;
      case "/customer-dashboard/shopping-cart/checkout":
        return 2;
      case "/customer-dashboard/shopping-cart/complete":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Stepper activeStep={getCurrentStep()} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              icon={
                <Link
                  to={
                    index === 0
                      ? "select-product"
                      : index === 1
                      ? "shopping-basket"
                      : index === 2
                      ? "checkout"
                      : "complete"
                  }
                >
                  {step.icon}
                </Link>
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Routes>
        <Route
          path="select-product"
          element={<SelectProduct addToCart={addToCart} />}
        />
        <Route
          path="shopping-basket"
          element={
            <ShoppingBasket
              cart={cart}
              removeFromCart={removeFromCart}
              onBookClick={handleBookClick}
            />
          }
        />
        <Route path="checkout" element={<Checkout cart={cart} />} />
        <Route path="complete" element={<Complete cart={cart} />} />
      </Routes>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            width: "80%",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          {selectedBook && (
            <BookDetail book={selectedBook} addToCart={addToCart} />
          )}
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
            关闭
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ShoppingCart;
