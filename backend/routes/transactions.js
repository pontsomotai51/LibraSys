
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET transactions
// Admins see all; members see only their own.
router.get("/", verifyToken, (req, res) => {
  let sql = `
    SELECT
      transactions.id,
      transactions.user_id,
      transactions.book_id,
      transactions.borrow_date,
      transactions.due_date,
      transactions.return_date,
      transactions.status,
      users.full_name,
      books.title
    FROM transactions
    JOIN users ON transactions.user_id = users.id
    JOIN books ON transactions.book_id = books.id
  `;

  const params = [];

  if (req.user.role !== "admin") {
    sql += " WHERE transactions.user_id = ?";
    params.push(req.user.id);
  }

  sql += " ORDER BY transactions.id DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Could not retrieve transactions.",
      });
    }

    res.json(results);
  });
});

// BORROW a book
// ONLY MEMBERS can borrow books.
router.post("/", verifyToken, (req, res) => {
  if (req.user.role !== "member") {
    return res.status(403).json({
      error: "Only library members are allowed to borrow books.",
    });
  }

  const { book_id, borrow_date, due_date } = req.body;

  if (!book_id || !borrow_date || !due_date) {
    return res.status(400).json({
      error: "Please provide a book, borrow date and due date.",
    });
  }

  const bookId = Number(book_id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({
      error: "Invalid book ID.",
    });
  }

  const borrowDate = new Date(borrow_date);
  const dueDate = new Date(due_date);

  if (
    Number.isNaN(borrowDate.getTime()) ||
    Number.isNaN(dueDate.getTime()) ||
    dueDate <= borrowDate
  ) {
    return res.status(400).json({
      error: "Please provide valid dates. The due date must be after the borrow date.",
    });
  }

  const userId = req.user.id;

  // Reduce stock only when a copy is available.
  db.query(
    "UPDATE books SET quantity = quantity - 1 WHERE id = ? AND quantity > 0",
    [bookId],
    (stockErr, stockResult) => {
      if (stockErr) {
        return res.status(500).json({
          error: "Could not update book stock.",
        });
      }

      if (stockResult.affectedRows === 0) {
        return res.status(400).json({
          error: "Book not found or this book is out of stock.",
        });
      }

      const insertSql = `
        INSERT INTO transactions
        (user_id, book_id, borrow_date, due_date, status)
        VALUES (?, ?, ?, ?, 'borrowed')
      `;

      db.query(
        insertSql,
        [userId, bookId, borrow_date, due_date],
        (insertErr, result) => {
          if (insertErr) {
            db.query(
              "UPDATE books SET quantity = quantity + 1 WHERE id = ?",
              [bookId],
              () => {
                return res.status(500).json({
                  error: "Could not create borrowing transaction.",
                });
              }
            );

            return;
          }

          res.status(201).json({
            message: "Book borrowed successfully!",
            transactionId: result.insertId,
          });
        }
      );
    }
  );
});

// RETURN a borrowed book
// Admins can return any book; members can return their own.
router.put("/:id/return", verifyToken, (req, res) => {
  const transactionId = Number(req.params.id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      error: "Invalid transaction ID.",
    });
  }

  let findSql = `
    SELECT book_id, user_id, status
    FROM transactions
    WHERE id = ?
  `;

  const findParams = [transactionId];

  if (req.user.role !== "admin") {
    findSql += " AND user_id = ?";
    findParams.push(req.user.id);
  }

  db.query(findSql, findParams, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Could not retrieve transaction.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Transaction not found or you do not have permission to return it.",
      });
    }

    if (results[0].status === "returned") {
      return res.status(400).json({
        error: "This book has already been returned.",
      });
    }

    const bookId = results[0].book_id;

    db.query(
      `UPDATE transactions
       SET status = 'returned', return_date = CURDATE()
       WHERE id = ? AND status = 'borrowed'`,
      [transactionId],
      (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({
            error: "Could not record the book return.",
          });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(400).json({
            error: "This book has already been returned.",
          });
        }

        db.query(
          "UPDATE books SET quantity = quantity + 1 WHERE id = ?",
          [bookId],
          (stockErr) => {
            if (stockErr) {
              return res.status(500).json({
                error: "Return recorded, but book stock could not be updated.",
              });
            }

            res.json({
              message: "Book returned successfully!",
            });
          }
        );
      }
    );
  });
});

module.exports = router;
