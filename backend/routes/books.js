
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// GET: Retrieve all books (PUBLIC)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM books ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to retrieve books",
      });
    }

    res.status(200).json(results);
  });
});

// POST: Add a new book (ADMIN ONLY)
router.post("/", verifyToken, verifyAdmin, (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;

  if (!title || !author || !genre || !isbn || quantity === undefined) {
    return res.status(400).json({
      message: "Please provide all book details",
    });
  }

  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative whole number",
    });
  }

  const sql = `
    INSERT INTO books (title, author, genre, isbn, quantity)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "A book with this ISBN already exists",
          });
        }

        return res.status(500).json({
          message: "Failed to add book",
        });
      }

      res.status(201).json({
        message: "Book added successfully",
        bookId: result.insertId,
      });
    }
  );
});

// PUT: Update an existing book (ADMIN ONLY)
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  if (!title || !author || !genre || !isbn || quantity === undefined) {
    return res.status(400).json({
      message: "Please provide all book details",
    });
  }

  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative whole number",
    });
  }

  const sql = `
    UPDATE books
    SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), id],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "A book with this ISBN already exists",
          });
        }

        return res.status(500).json({
          message: "Failed to update book",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Book not found",
        });
      }

      res.status(200).json({
        message: "Book updated successfully",
      });
    }
  );
});

// DELETE: Delete a book (ADMIN ONLY)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const sql = "DELETE FROM books WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          message: "This book has transaction records and cannot be deleted",
        });
      }

      return res.status(500).json({
        message: "Failed to delete book",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  });
});

module.exports = router;
