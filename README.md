# LibraSys – Library Management System

## 1. Project Description

LibraSys is a web-based Library Management System developed for the Web Application Development (BIWA2110) assignment.

The system helps libraries manage books, registered members, borrowing transactions and book returns. It provides separate access for administrators and library members.

## 2. Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router
- Fetch API

### Backend
- Node.js
- Express.js
- REST API
- MySQL
- JWT Authentication
- bcryptjs

## 3. Main System Features

### Administrator Features
- Secure administrator login.
- View the library dashboard and statistics.
- Add, update, delete and search books.
- Manage book quantities and stock.
- Register, update and delete library members.
- View borrowing transactions.
- Monitor returned and overdue books.

### Member Features
- Secure member login.
- Browse available books.
- Borrow available books.
- View borrowing history.
- Return borrowed books.

### Additional Features
- Role-based access control.
- Form validation.
- Password hashing.
- JWT authentication.
- Automatic stock updates when books are borrowed or returned.
- Database integration using MySQL.

## 4. Project Structure

```text
LibrarySystem/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── Users.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## 5. Database Configuration

The application uses MySQL.

Database name:

`librasys`

The database contains three main tables:

- `books` – Stores book information and available quantities.
- `users` – Stores administrator and member accounts.
- `transactions` – Stores borrowing and returning records.

Configure the database connection in the backend `.env` file using your own local credentials.

Required environment variables:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=librasys
JWT_SECRET=your_secret_key
```

Do not upload your `.env` file or database passwords to GitHub.

## 6. Installation and Setup

### Requirements

- Node.js and npm
- MySQL Server
- Visual Studio Code
- A modern web browser

### Step 1: Install Backend Dependencies

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

### Step 2: Start the Backend Server

```bash
node server.js
```

The backend runs at:

`http://localhost:5000`

### Step 3: Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### Step 4: Start the Frontend

```bash
npm run dev
```

Open the application in your browser:

`http://localhost:5173`

## 7. API Endpoints

The backend provides the following main API routes:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/books` | Retrieve books |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/users` | Retrieve users (admin) |
| POST | `/api/users` | Register a member |
| POST | `/api/users/login` | Authenticate a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |
| GET | `/api/transactions` | Retrieve transactions |
| POST | `/api/transactions` | Borrow a book |
| PUT | `/api/transactions/:id/return` | Return a book |

Protected endpoints require authentication and appropriate permissions.

## 8. Security

- Passwords are hashed using bcryptjs.
- JSON Web Tokens are used for authentication.
- Administrators and members have different permissions.
- Backend middleware protects restricted API operations.
- Members cannot access administrator-only functions.

## 9. Conclusion

LibraSys provides a centralized solution for managing library operations. It demonstrates the use of React, Express.js, REST APIs, MySQL database integration and authentication in web application development.

**Project:** LibraSys – Library Management System  
**Course:** Web Application Development (BIWA2110)
