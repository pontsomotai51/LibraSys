
import BookTable from "../components/BookTable.jsx";

function Books({
  books,
  filteredBooks,
  search,
  setSearch,
  isAdmin,
  showBookForm,
  editingBookId,
  bookForm,
  handleBookInput,
  handleBookSubmit,
  openAddBookForm,
  setShowBookForm,
  error,
  openEditBookForm,
  deleteBook,
  getStockStatus,
}) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>{isAdmin ? "Book Management" : "Browse Books"}</h2>
          <p>
            {isAdmin
              ? "Add, update, search and manage your library books."
              : "Browse the books available in your library."}
          </p>
        </div>

        {isAdmin && (
          <button className="primary-button" onClick={openAddBookForm}>
            + Add New Book
          </button>
        )}
      </div>

      {isAdmin && showBookForm && (
        <div className="form-card">
          <div className="section-heading">
            <h2>{editingBookId ? "Edit Book" : "Add New Book"}</h2>

            <button
              className="close-button"
              onClick={() => setShowBookForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleBookSubmit}>
            <div className="form-grid">
              <label>
                Book Title
                <input
                  name="title"
                  value={bookForm.title}
                  onChange={handleBookInput}
                  required
                />
              </label>

              <label>
                Author
                <input
                  name="author"
                  value={bookForm.author}
                  onChange={handleBookInput}
                  required
                />
              </label>

              <label>
                Genre
                <select
                  name="genre"
                  value={bookForm.genre}
                  onChange={handleBookInput}
                  required
                >
                  <option value="">Select genre</option>
                  <option>Fiction</option>
                  <option>Non-fiction</option>
                  <option>Classic</option>
                  <option>Adventure</option>
                  <option>Historical</option>
                  <option>Science</option>
                  <option>Technology</option>
                  <option>Biography</option>
                  <option>African Literature</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                ISBN
                <input
                  name="isbn"
                  value={bookForm.isbn}
                  onChange={handleBookInput}
                  required
                />
              </label>

              <label>
                Stock Quantity
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="quantity"
                  value={bookForm.quantity}
                  onChange={handleBookInput}
                  required
                />
              </label>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowBookForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                {editingBookId ? "Save Changes" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="section-heading">
          <h2>All Books ({books.length})</h2>

          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, author or ISBN..."
          />
        </div>

        <BookTable
          books={filteredBooks}
          onEdit={openEditBookForm}
          onDelete={deleteBook}
          getStockStatus={getStockStatus}
          canManage={isAdmin}
        />

        {filteredBooks.length === 0 && (
          <p className="empty-message">No books found.</p>
        )}
      </div>
    </section>
  );
}

export default Books;
