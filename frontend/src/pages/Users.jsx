
function Users({
  users,
  showUserForm,
  editingUserId,
  userForm,
  handleUserInput,
  handleUserSubmit,
  openAddUserForm,
  openEditUserForm,
  deleteUser,
  setShowUserForm,
  error,
}) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>User Management</h2>
          <p>Register and manage library members.</p>
        </div>

        <button className="primary-button" onClick={openAddUserForm}>
          + Register User
        </button>
      </div>

      {showUserForm && (
        <div className="form-card">
          <div className="section-heading">
            <h2>{editingUserId ? "Edit User" : "Register New User"}</h2>

            <button
              className="close-button"
              onClick={() => setShowUserForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleUserSubmit}>
            <div className="form-grid">
              <label>
                Full Name
                <input
                  name="full_name"
                  value={userForm.full_name}
                  onChange={handleUserInput}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserInput}
                  placeholder="Enter email address"
                  required
                />
              </label>

              {!editingUserId && (
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserInput}
                    placeholder="At least 8 characters"
                    minLength="8"
                    required
                  />
                </label>
              )}
            </div>

            {editingUserId && (
              <p className="empty-message">
                Password is not changed when editing user details.
              </p>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowUserForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                {editingUserId ? "Save Changes" : "Register User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="section-heading">
          <h2>Registered Users ({users.length})</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.full_name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => openEditUserForm(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="empty-message">
            No users registered yet. Click Register User to begin.
          </p>
        )}
      </div>
    </section>
  );
}

export default Users;
