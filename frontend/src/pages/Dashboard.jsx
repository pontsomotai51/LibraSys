
import { useNavigate } from "react-router-dom";
import BookTable from "../components/BookTable.jsx";

function Dashboard({
  books,
  users,
  transactions,
  isAdmin,
  StatCard,
  overdueTransactions,
  openAddBookForm,
  openEditBookForm,
  deleteBook,
  getStockStatus,
}) {
  const navigate = useNavigate();

  const totalCopies = books.reduce(
    (total, book) => total + Number(book.quantity),
    0
  );

  const lowStock = books.filter(
    (book) => Number(book.quantity) > 0 && Number(book.quantity) < 2
  ).length;

  const outOfStock = books.filter(
    (book) => Number(book.quantity) === 0
  ).length;

  const activeBorrowings = transactions.filter(
    (transaction) => transaction.status === "borrowed"
  ).length;

  const returnedBooks = transactions.filter(
    (transaction) => transaction.status === "returned"
  ).length;

  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>{isAdmin ? "Library Overview" : "Member Dashboard"}</h2>
          <p>
            {isAdmin
              ? "Here's what's happening in your library."
              : "Welcome to your library. Browse books and manage your borrowings."}
          </p>
        </div>

        {isAdmin && (
          <button
            className="primary-button"
            onClick={() => {
              navigate("/books");
              openAddBookForm();
            }}
          >
            + Add New Book
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="Total Books" value={totalCopies} />
        <StatCard title="Book Titles" value={books.length} />
        <StatCard title="Low Stock" value={lowStock} />
        <StatCard title="Out of Stock" value={outOfStock} />
      </div>

      <div className="stats-grid">
        {isAdmin && (
          <StatCard title="Registered Users" value={users.length} />
        )}
        <StatCard title="Active Borrowings" value={activeBorrowings} />
        <StatCard title="Total Transactions" value={transactions.length} />
        <StatCard title="Returned Books" value={returnedBooks} />
      </div>

      <div className="stats-grid">
        <StatCard title="Overdue Books" value={overdueTransactions} />
      </div>

      <div className="table-card">
        <div className="section-heading">
          <h2>Recently Added Books</h2>

          <button
            className="text-button"
            onClick={() => navigate("/books")}
          >
            View all books →
          </button>
        </div>

        <BookTable
          books={books.slice(0, 5)}
          onEdit={openEditBookForm}
          onDelete={deleteBook}
          getStockStatus={getStockStatus}
          canManage={isAdmin}
        />
      </div>
    </section>
  );
}

export default Dashboard;
