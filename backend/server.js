
const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
const booksRoutes = require("./routes/books");
const transactionsRoutes = require("./routes/transactions");
const usersRoutes = require("./routes/users");

// Connect routes
app.use("/api/books", booksRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/users", usersRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("LibraSys Backend Server is running successfully!");
});

// API test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Welcome to LibraSys API!",
    status: "success",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LibraSys server running on http://localhost:${PORT}`);
});
