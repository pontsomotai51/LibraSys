
import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import Login from "./login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Books from "./pages/Books.jsx";
import Transactions from "./pages/Transactions.jsx";
import Users from "./pages/Users.jsx";

const BOOKS_API = "http://localhost:5000/api/books";
const USERS_API = "http://localhost:5000/api/users";
const TRANSACTIONS_API = "http://localhost:5000/api/transactions";

const emptyBook = {
  title: "",
  author: "",
  genre: "",
  isbn: "",
  quantity: "",
};

const emptyUser = {
  full_name: "",
  email: "",
  password: "",
};

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function getResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Something went wrong."
    );
  }

  return data;
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function LibraryApp() {
  // AUTHENTICATION

  const [auth, setAuth] = useState(() => {
    try {
      const token = sessionStorage.getItem("librasys_token");

      const user = JSON.parse(
        sessionStorage.getItem("librasys_user") || "null"
      );

      if (token && user) {
        return { token, user };
      }
    } catch {
      sessionStorage.removeItem("librasys_token");
      sessionStorage.removeItem("librasys_user");
    }

    return null;
  });

  const isAdmin = auth?.user?.role === "admin";
  const isMember = auth?.user?.role === "member";

  const navigate = useNavigate();
  const location = useLocation();

  const pageFromPath = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/books": "Books",
    "/transactions": "Transactions",
    "/users": "Users",
  };

  const activePage =
    pageFromPath[location.pathname] || "Dashboard";

  function setActivePage(page) {
    const paths = {
      Dashboard: "/dashboard",
      Books: "/books",
      Transactions: "/transactions",
      Users: "/users",
    };

    navigate(paths[page] || "/dashboard");
  }

  useEffect(() => {
    if (!pageFromPath[location.pathname]) {
      navigate(auth ? "/dashboard" : "/", {
        replace: true,
      });
    }
  }, [location.pathname, auth, navigate]);

  // APPLICATION DATA

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [apiError, setApiError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  // BOOK FORM

  const [bookForm, setBookForm] = useState(emptyBook);
  const [editingBookId, setEditingBookId] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);

  // USER FORM

  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // TRANSACTION FORM

  const [transactionForm, setTransactionForm] = useState({
    user_id: "",
    book_id: "",
    borrow_date: today(),
    due_date: "",
  });

  // API AUTHENTICATION HEADERS

  function authHeaders(extraHeaders = {}) {
    const token =
      auth?.token || sessionStorage.getItem("librasys_token");

    return {
      ...extraHeaders,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    };
  }

  // MESSAGE MANAGEMENT

  function clearMessages() {
    setError("");
    setApiError("");
    setSuccess("");
  }

  // LOAD BOOKS

  async function loadBooks() {
    const response = await fetch(BOOKS_API, {
      headers: authHeaders(),
    });

    setBooks(await getResponse(response));
  }

  // LOAD USERS

  async function loadUsers() {
    if (!isAdmin) {
      setUsers([]);
      return;
    }

    const response = await fetch(USERS_API, {
      headers: authHeaders(),
    });

    setUsers(await getResponse(response));
  }

  // LOAD TRANSACTIONS

  async function loadTransactions() {
    const response = await fetch(TRANSACTIONS_API, {
      headers: authHeaders(),
    });

    setTransactions(await getResponse(response));
  }

  // LOAD ALL APPLICATION DATA

  async function loadAllData() {
    setLoading(true);
    setApiError("");

    try {
      const requests = [
        loadBooks(),
        loadTransactions(),
      ];

      if (isAdmin) {
        requests.push(loadUsers());
      }

      await Promise.all(requests);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.token) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [auth?.token]);

  // PREVENT MEMBERS FROM ACCESSING USERS PAGE

  useEffect(() => {
    if (isMember && location.pathname === "/users") {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [isMember, location.pathname, navigate]);

  // LOGIN

  function handleLogin(loginData) {
    sessionStorage.setItem(
      "librasys_token",
      loginData.token
    );

    sessionStorage.setItem(
      "librasys_user",
      JSON.stringify(loginData.user)
    );

    setAuth(loginData);
    setActivePage("Dashboard");
    clearMessages();
  }

  // LOGOUT

  function handleLogout() {
    sessionStorage.removeItem("librasys_token");
    sessionStorage.removeItem("librasys_user");

    setAuth(null);

    setBooks([]);
    setUsers([]);
    setTransactions([]);

    setShowBookForm(false);
    setShowUserForm(false);

    setBookForm(emptyBook);
    setUserForm(emptyUser);

    navigate("/");
    clearMessages();
  }

  // DASHBOARD STATISTICS

  const overdueTransactions = transactions.filter(
    (transaction) => {
      const isBorrowed =
        normalizeStatus(transaction.status) === "borrowed";

      const dueDate = String(
        transaction.due_date || ""
      ).slice(0, 10);

      return (
        isBorrowed &&
        dueDate &&
        dueDate < today()
      );
    }
  ).length;

  // SEARCH BOOKS

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.isbn}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // BOOK STOCK STATUS

  function getStockStatus(quantity) {
    if (Number(quantity) === 0) {
      return "Out of Stock";
    }

    if (Number(quantity) < 2) {
      return "Low Stock";
    }

    return "Available";
  }

  // BOOK MANAGEMENT

  function handleBookInput(event) {
    const { name, value } = event.target;

    setBookForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function openAddBookForm() {
    clearMessages();

    setBookForm(emptyBook);
    setEditingBookId(null);
    setShowBookForm(true);
  }

  function openEditBookForm(book) {
    clearMessages();

    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: String(book.quantity),
    });

    setEditingBookId(book.id);
    setShowBookForm(true);
  }

  async function handleBookSubmit(event) {
    event.preventDefault();
    clearMessages();

    if (
      !bookForm.title.trim() ||
      !bookForm.author.trim() ||
      !bookForm.genre.trim() ||
      !bookForm.isbn.trim() ||
      bookForm.quantity === ""
    ) {
      setError("Please fill in all book fields.");
      return;
    }

    const quantity = Number(bookForm.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError(
        "Quantity must be a non-negative whole number."
      );
      return;
    }

    const bookData = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      genre: bookForm.genre.trim(),
      isbn: bookForm.isbn.trim(),
      quantity,
    };

    try {
      const url = editingBookId
        ? `${BOOKS_API}/${editingBookId}`
        : BOOKS_API;

      const response = await fetch(url, {
        method: editingBookId ? "PUT" : "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(bookData),
      });

      await getResponse(response);
      await loadBooks();

      const wasEditing = Boolean(editingBookId);

      setBookForm(emptyBook);
      setEditingBookId(null);
      setShowBookForm(false);

      setSuccess(
        wasEditing
          ? "Book updated successfully!"
          : "Book added successfully!"
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteBook(id) {
    clearMessages();

    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`${BOOKS_API}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      await getResponse(response);
      await loadAllData();

      setSuccess("Book deleted successfully!");
    } catch (err) {
      setApiError(err.message);
    }
  }

  // USER MANAGEMENT

  function handleUserInput(event) {
    const { name, value } = event.target;

    setUserForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function openAddUserForm() {
    clearMessages();

    setUserForm(emptyUser);
    setEditingUserId(null);
    setShowUserForm(true);
  }

  function openEditUserForm(user) {
    clearMessages();

    setUserForm({
      full_name: user.full_name,
      email: user.email,
      password: "",
    });

    setEditingUserId(user.id);
    setShowUserForm(true);
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    clearMessages();

    if (
      !userForm.full_name.trim() ||
      !userForm.email.trim()
    ) {
      setError(
        "Please enter the user's full name and email."
      );
      return;
    }

    if (
      !editingUserId &&
      (!userForm.password || userForm.password.length < 8)
    ) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    const userData = {
      full_name: userForm.full_name.trim(),
      email: userForm.email.trim(),
    };

    if (!editingUserId) {
      userData.password = userForm.password;
    } else {
      userData.role = "member";
    }

    try {
      const url = editingUserId
        ? `${USERS_API}/${editingUserId}`
        : USERS_API;

      const response = await fetch(url, {
        method: editingUserId ? "PUT" : "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(userData),
      });

      await getResponse(response);
      await loadUsers();

      const wasEditing = Boolean(editingUserId);

      setUserForm(emptyUser);
      setEditingUserId(null);
      setShowUserForm(false);

      setSuccess(
        wasEditing
          ? "User updated successfully!"
          : "User registered successfully!"
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(id) {
    clearMessages();

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${USERS_API}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      await getResponse(response);
      await loadUsers();

      setSuccess("User deleted successfully!");
    } catch (err) {
      setApiError(err.message);
    }
  }

  // TRANSACTION MANAGEMENT

  function handleTransactionInput(event) {
    const { name, value } = event.target;

    setTransactionForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // BORROW BOOK

  async function borrowBook(event) {
    event.preventDefault();
    clearMessages();

    if (
      !transactionForm.book_id ||
      !transactionForm.borrow_date ||
      !transactionForm.due_date
    ) {
      setError("Please complete all borrowing fields.");
      return;
    }

    if (isAdmin && !transactionForm.user_id) {
      setError("Please select a library user.");
      return;
    }

    if (
      transactionForm.due_date <=
      transactionForm.borrow_date
    ) {
      setError(
        "The due date must be after the borrowing date."
      );
      return;
    }

    try {
      const borrowingData = {
        book_id: Number(transactionForm.book_id),
        borrow_date: transactionForm.borrow_date,
        due_date: transactionForm.due_date,
      };

      if (isAdmin) {
        borrowingData.user_id = Number(
          transactionForm.user_id
        );
      } else {
        borrowingData.user_id = auth.user.id;
      }

      const response = await fetch(TRANSACTIONS_API, {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(borrowingData),
      });

      await getResponse(response);

      await Promise.all([
        loadBooks(),
        loadTransactions(),
      ]);

      setTransactionForm({
        user_id: "",
        book_id: "",
        borrow_date: today(),
        due_date: "",
      });

      setSuccess("Book borrowed successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  // RETURN BOOK

  async function returnBook(transactionId) {
    clearMessages();

    if (
      !window.confirm(
        "Confirm that this book has been returned?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${TRANSACTIONS_API}/${transactionId}/return`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      await getResponse(response);

      await Promise.all([
        loadBooks(),
        loadTransactions(),
      ]);

      setSuccess("Book returned successfully!");
    } catch (err) {
      setApiError(err.message);
    }
  }

  // DASHBOARD STAT CARD

  function StatCard({ title, value, icon }) {
    return (
      <div className="stat-card">
        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        {icon && (
          <span className="stat-icon">{icon}</span>
        )}
      </div>
    );
  }

  // SHOW LOGIN PAGE WHEN NOT AUTHENTICATED

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  // SIDEBAR PAGES

  const pages = isAdmin
    ? ["Dashboard", "Books", "Transactions", "Users"]
    : ["Dashboard", "Books", "Transactions"];

  // MAIN APPLICATION LAYOUT

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <h2>LibraSys</h2>
        </div>

        <p className="menu-label">MAIN MENU</p>

        {pages.map((page) => (
          <button
            key={page}
            className={`nav-button ${
              activePage === page ? "active" : ""
            }`}
            onClick={() => {
              setActivePage(page);
              setShowBookForm(false);
              setShowUserForm(false);
              clearMessages();
            }}
          >
            <span>
              {page === "Dashboard" && "▦"}
              {page === "Books" && "📖"}
              {page === "Transactions" && "↔"}
              {page === "Users" && "♙"}
            </span>

            {page}
          </button>
        ))}

        <div className="sidebar-footer">
          <p>Library Management System</p>
          <small>Signed in as {auth.user.role}</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="welcome-text">
              Welcome back, {auth.user.full_name}
            </p>

            <h1>{activePage}</h1>
          </div>

          <div className="admin-profile">
            <span>👤</span>

            <div>
              <strong>{auth.user.full_name}</strong>
              <small>{auth.user.role}</small>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {apiError && (
          <p className="error-message">{apiError}</p>
        )}

        {success && (
          <p className="success-message">{success}</p>
        )}

        {/* REACT ROUTER PAGES */}

        {loading ? (
          <p className="empty-message">
            Loading library data...
          </p>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Navigate to="/dashboard" replace />
              }
            />

            {/* DASHBOARD PAGE */}

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  books={books}
                  users={users}
                  transactions={transactions}
                  isAdmin={isAdmin}
                  StatCard={StatCard}
                  overdueTransactions={overdueTransactions}
                  openAddBookForm={openAddBookForm}
                  openEditBookForm={openEditBookForm}
                  deleteBook={deleteBook}
                  getStockStatus={getStockStatus}
                />
              }
            />

            {/* BOOKS PAGE */}

            <Route
              path="/books"
              element={
                <Books
                  books={books}
                  filteredBooks={filteredBooks}
                  search={search}
                  setSearch={setSearch}
                  isAdmin={isAdmin}
                  showBookForm={showBookForm}
                  editingBookId={editingBookId}
                  bookForm={bookForm}
                  handleBookInput={handleBookInput}
                  handleBookSubmit={handleBookSubmit}
                  openAddBookForm={openAddBookForm}
                  setShowBookForm={setShowBookForm}
                  error={error}
                  openEditBookForm={openEditBookForm}
                  deleteBook={deleteBook}
                  getStockStatus={getStockStatus}
                />
              }
            />

            {/* TRANSACTIONS PAGE */}

            <Route
              path="/transactions"
              element={
                <Transactions
                  books={books}
                  users={users}
                  transactions={transactions}
                  isAdmin={isAdmin}
                  auth={auth}
                  transactionForm={transactionForm}
                  handleTransactionInput={handleTransactionInput}
                  borrowBook={borrowBook}
                  returnBook={returnBook}
                  error={error}
                />
              }
            />

            {/* USERS PAGE - ADMIN ONLY */}

            <Route
              path="/users"
              element={
                isAdmin ? (
                  <Users
                    users={users}
                    showUserForm={showUserForm}
                    editingUserId={editingUserId}
                    userForm={userForm}
                    handleUserInput={handleUserInput}
                    handleUserSubmit={handleUserSubmit}
                    openAddUserForm={openAddUserForm}
                    openEditUserForm={openEditUserForm}
                    deleteUser={deleteUser}
                    setShowUserForm={setShowUserForm}
                    error={error}
                  />
                ) : (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                )
              }
            />

            {/* UNKNOWN PAGE */}

            <Route
              path="*"
              element={
                <Navigate to="/dashboard" replace />
              }
            />
          </Routes>
        )}
      </main>
    </div>
  );
}

function App() {
  return <LibraryApp />;
}

export default App;
