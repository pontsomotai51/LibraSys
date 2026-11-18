
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// GET all users - ADMIN ONLY
router.get("/", verifyToken, verifyAdmin, (req, res) => {
  const sql = `
    SELECT id, full_name, email, role, created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Could not retrieve users.",
      });
    }

    res.json(results);
  });
});

// LOGIN - PUBLIC
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Login configuration is missing on the server.",
      });
    }

    const sql = `
      SELECT id, full_name, email, password_hash, role
      FROM users
      WHERE email = ?
      LIMIT 1
    `;

    db.query(sql, [email.trim()], async (err, results) => {
      if (err) {
        return res.status(500).json({
          error: "Login could not be completed.",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password.",
        });
      }

      const user = results[0];

      try {
        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return res.status(401).json({
            error: "Invalid email or password.",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.json({
          message: "Login successful!",
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        res.status(500).json({
          error: "An error occurred during login.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred during login.",
    });
  }
});

// REGISTER - PUBLIC, MEMBER ROLE ONLY
router.post("/", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "Full name, email and password are required.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (?, ?, ?, 'member')
    `;

    db.query(
      sql,
      [full_name.trim(), email.trim(), passwordHash],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              error: "This email address is already registered.",
            });
          }

          return res.status(500).json({
            error: "Could not register user.",
          });
        }

        res.status(201).json({
          message: "User registered successfully!",
          userId: result.insertId,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: "Could not register user.",
    });
  }
});

// UPDATE USER - ADMIN ONLY
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { full_name, email, role } = req.body;
  const userId = req.params.id;

  if (
    !full_name ||
    !email ||
    !["admin", "member"].includes(role)
  ) {
    return res.status(400).json({
      error: "Valid full name, email and role are required.",
    });
  }

  const sql = `
    UPDATE users
    SET full_name = ?, email = ?, role = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [full_name.trim(), email.trim(), role, userId],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: "This email address is already registered.",
          });
        }

        return res.status(500).json({
          error: "Could not update user.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      res.json({
        message: "User updated successfully!",
      });
    }
  );
});

// DELETE USER - ADMIN ONLY
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          error: "This user has borrowing records and cannot be deleted.",
        });
      }

      return res.status(500).json({
        error: "Could not delete user.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    res.json({
      message: "User deleted successfully!",
    });
  });
});

module.exports = router;
