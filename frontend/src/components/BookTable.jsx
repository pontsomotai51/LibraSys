
function BookTable({
  books,
  onEdit,
  onDelete,
  getStockStatus,
  canManage,
}) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Quantity</th>
            <th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td><strong>{book.title}</strong></td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
              <td>
                <span
                  className={`stock-status ${
                    Number(book.quantity) === 0
                      ? "out"
                      : Number(book.quantity) < 2
                      ? "low"
                      : "available"
                  }`}
                >
                  {getStockStatus(book.quantity)}
                </span>
              </td>

              {canManage && (
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => onEdit(book)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => onDelete(book.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookTable;
