
function Transactions({
  books,
  users,
  transactions,
  isAdmin,
  auth,
  transactionForm,
  handleTransactionInput,
  borrowBook,
  returnBook,
  error,
}) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Library Transactions</h2>
          <p>
            {isAdmin
              ? "Manage book borrowing and returns."
              : "Borrow books and view your borrowing history."}
          </p>
        </div>
      </div>

      <div className="form-card">
        <div className="section-heading">
          <h2>Borrow a Book</h2>
        </div>

        {books.every((book) => Number(book.quantity) < 1) ? (
          <p className="empty-message">
            There are currently no books available for borrowing.
          </p>
        ) : (
          <form onSubmit={borrowBook}>
            <div className="form-grid">
              {isAdmin ? (
                <label>
                  Select Library User
                  <select
                    name="user_id"
                    value={transactionForm.user_id}
                    onChange={handleTransactionInput}
                    required
                  >
                    <option value="">Choose a user</option>
                    {users
                      .filter((user) => user.role === "member")
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
                  </select>
                </label>
              ) : (
                <label>
                  Borrowing Account
                  <input
                    value={`${auth.user.full_name} (${auth.user.email})`}
                    readOnly
                  />
                </label>
              )}

              <label>
                Select Book
                <select
                  name="book_id"
                  value={transactionForm.book_id}
                  onChange={handleTransactionInput}
                  required
                >
                  <option value="">Choose a book</option>
                  {books
                    .filter((book) => Number(book.quantity) > 0)
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.quantity} available
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Borrow Date
                <input
                  type="date"
                  name="borrow_date"
                  value={transactionForm.borrow_date}
                  onChange={handleTransactionInput}
                  required
                />
              </label>

              <label>
                Due Date
                <input
                  type="date"
                  name="due_date"
                  min={transactionForm.borrow_date}
                  value={transactionForm.due_date}
                  onChange={handleTransactionInput}
                  required
                />
              </label>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {isAdmin ? "Record Borrowing" : "Borrow Book"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="table-card">
        <div className="section-heading">
          <h2>Borrowing History ({transactions.length})</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Library User</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const status = String(transaction.status || "")
                  .trim()
                  .toLowerCase();

                const isBorrowed = status === "borrowed";

                return (
                  <tr key={transaction.id}>
                    <td>{transaction.full_name}</td>
                    <td><strong>{transaction.title}</strong></td>
                    <td>{String(transaction.borrow_date).slice(0, 10)}</td>
                    <td>{String(transaction.due_date).slice(0, 10)}</td>
                    <td>
                      {transaction.return_date
                        ? String(transaction.return_date).slice(0, 10)
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`stock-status ${
                          status === "returned" ? "available" : "low"
                        }`}
                      >
                        {status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      {isBorrowed ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => returnBook(transaction.id)}
                        >
                          Return Book
                        </button>
                      ) : (
                        <span>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <p className="empty-message">
            No borrowing transactions recorded yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default Transactions;
