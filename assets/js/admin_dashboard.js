// Admin Dashboard - Real Data Integration
document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
  loadDashboardData();
});

function checkAuthentication() {
  const auth = checkRole('admin');
  if (!auth) return;

  // Load user profile
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('adminName').textContent = user.name;
  document.getElementById('adminEmail').textContent = user.email;
}

async function loadDashboardData() {
  try {
    // Load users
    await loadUsers();

    // Load books
    await loadBooks();

    // Load statistics
    await loadStatistics();

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data');
  }
}

async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users', {
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      const users = await response.json();
      displayUsers(users);
      updateUserStats(users);
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showError('Failed to load users');
  }
}

async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');

    if (response.ok) {
      const books = await response.json();
      displayBooks(books);
      updateBookStats(books);
    } else {
      throw new Error('Failed to fetch books');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    showError('Failed to load books');
  }
}

async function loadStatistics() {
  try {
    const token = localStorage.getItem('token');

    // Get all users for stats
    const usersResponse = await fetch('http://localhost:5000/api/users', {
      headers: {
        'x-auth-token': token
      }
    });

    // Get all books for stats
    const booksResponse = await fetch('http://localhost:5000/api/books');

    if (usersResponse.ok && booksResponse.ok) {
      const users = await usersResponse.json();
      const books = await booksResponse.json();

      // Calculate statistics
      const totalUsers = users.length;
      const totalBooks = books.length;
      const availableBooks = books.filter(book => book.availableCopies > 0).length;
      const borrowedBooks = books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0);

      // Update statistics display
      document.getElementById('totalUsers').textContent = totalUsers;
      document.getElementById('totalBooks').textContent = totalBooks;
      document.getElementById('availableBooks').textContent = availableBooks;
      document.getElementById('borrowedBooks').textContent = borrowedBooks;
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

function displayUsers(users) {
  const userTableBody = document.getElementById('userTableBody');
  userTableBody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role-badge role-${user.role}">${user.role}</span></td>
      <td>${user.department || 'N/A'}</td>
      <td>${user.enrollmentNumber || 'N/A'}</td>
      <td>${user.borrowedBooks?.length || 0}</td>
      <td>₹${user.fines || 0}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewUser('${user._id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
}

function displayBooks(books) {
  const bookTableBody = document.getElementById('bookTableBody');
  bookTableBody.innerHTML = '';

  books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td>${book.category}</td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td>${book.location}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewBook('${book._id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editBook('${book._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBook('${book._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    bookTableBody.appendChild(row);
  });
}

function updateUserStats(users) {
  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    librarian: users.filter(u => u.role === 'librarian').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length
  };

  // Update role distribution chart or display
  console.log('User role distribution:', roleStats);
}

function updateBookStats(books) {
  const categoryStats = {};
  books.forEach(book => {
    categoryStats[book.category] = (categoryStats[book.category] || 0) + 1;
  });

  console.log('Book category distribution:', categoryStats);
}

// User management functions
async function addUser() {
  const userData = {
    name: document.getElementById('uname').value,
    email: document.getElementById('uemail').value,
    password: document.getElementById('upassword').value,
    role: document.getElementById('urole').value,
    department: document.getElementById('udept').value,
    enrollmentNumber: document.getElementById('uenrollment').value
  };

  if (!userData.name || !userData.email || !userData.password) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      alert('User added successfully');
      closeModal();
      loadUsers(); // Refresh user list
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to add user');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Network error. Please try again.');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      alert('User deleted successfully');
      loadUsers(); // Refresh user list
    } else {
      alert('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Network error. Please try again.');
  }
}

// Book management functions
async function addBook() {
  const bookData = {
    title: document.getElementById('btitle').value,
    author: document.getElementById('bauthor').value,
    isbn: document.getElementById('bisbn').value,
    category: document.getElementById('bcategory').value,
    description: document.getElementById('bdescription').value,
    totalCopies: parseInt(document.getElementById('bcopies').value),
    location: document.getElementById('blocation').value,
    imageUrl: document.getElementById('bimage').value,
    publishedYear: parseInt(document.getElementById('byear').value),
    publisher: document.getElementById('bpublisher').value
  };

  if (!bookData.title || !bookData.author || !bookData.isbn) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(bookData)
    });

    if (response.ok) {
      alert('Book added successfully');
      closeBookModal();
      loadBooks(); // Refresh book list
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Network error. Please try again.');
  }
}

async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      alert('Book deleted successfully');
      loadBooks(); // Refresh book list
    } else {
      alert('Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Network error. Please try again.');
  }
}

// Modal functions
function openModal() {
  document.getElementById('addUserModal').classList.add('active');
}

function closeModal() {
  document.getElementById('addUserModal').classList.remove('active');
}

function openBookModal() {
  document.getElementById('addBookModal').classList.add('active');
}

function closeBookModal() {
  document.getElementById('addBookModal').classList.remove('active');
}

// Close on backdrop
document.getElementById('addUserModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('addBookModal').addEventListener('click', function(e) {
  if (e.target === this) closeBookModal();
});

// Placeholder functions for view/edit (can be implemented later)
function viewUser(userId) { alert('View user functionality coming soon'); }
function editUser(userId) { alert('Edit user functionality coming soon'); }
function viewBook(bookId) { alert('View book functionality coming soon'); }
function editBook(bookId) { alert('Edit book functionality coming soon'); }

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function showError(message) {
  // You can implement a proper error display
  console.error(message);
  alert(message);
}