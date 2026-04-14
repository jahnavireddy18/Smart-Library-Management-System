// Student Dashboard - Real Data Integration
let books = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
  loadBooks();
  loadUserProfile();
  loadNotifications();
});

function checkAuthentication() {
  const auth = checkRole('student');
  if (!auth) return;

  currentUser = JSON.parse(localStorage.getItem('user'));
  document.getElementById('pname').textContent = currentUser.name;
  document.getElementById('pemail').textContent = currentUser.email;
}

/* ── Profile ── */
async function loadUserProfile() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      const profile = await response.json();
      updateProfileDisplay(profile);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function updateProfileDisplay(profile) {
  document.getElementById('pname').textContent = profile.name;
  document.getElementById('pemail').textContent = profile.email;
  document.getElementById('name').value = profile.name;
  document.getElementById('email').value = profile.email;
  document.getElementById('phone').value = profile.phone || '';
  document.getElementById('branch').value = profile.department || '';

  // Update borrowed books count
  const borrowedCount = profile.borrowedBooks ? profile.borrowedBooks.length : 0;
  document.getElementById('borrowedBooksCount').textContent = borrowedCount;

  // Update fines
  document.getElementById('finesAmount').textContent = `₹${profile.fines || 0}`;
}

function toggleProfile() { document.getElementById('profileDrop').classList.toggle('active'); }
function openProfile() { document.getElementById('profileDrop').classList.add('active'); }

function enableEdit() { document.querySelectorAll('#profileDrop input').forEach(i => i.disabled = false); }

async function saveProfile() {
  const profileData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    department: document.getElementById('branch').value
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(profileData)
    });

    if (response.ok) {
      alert('Profile updated successfully');
      loadUserProfile(); // Refresh profile
      document.querySelectorAll('#profileDrop input').forEach(i => i.disabled = true);
    } else {
      alert('Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Network error. Please try again.');
  }
}

function uploadImage(e) {
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function () {
    document.getElementById('profileImg').src = reader.result;
    document.getElementById('topProfileImg').src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ── Books ── */
async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');

    if (response.ok) {
      books = await response.json();
      displayBooks(books);
      updateBookStats();
    } else {
      throw new Error('Failed to fetch books');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
    showError('Failed to load books from library');
  }
}

function displayBooks(bookList) {
  const container = document.getElementById('bookContainer');
  container.innerHTML = '';

  if (bookList.length === 0) {
    container.innerHTML = '<div class="no-books">No books found</div>';
    return;
  }

  bookList.forEach(book => {
    const isAvailable = book.availableCopies > 0;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.imageUrl || 'assets/img/book-placeholder.jpg'}" alt="${book.title}" onerror="this.src='assets/img/book-placeholder.jpg'">
      <div class="card-body">
        <h4>${book.title}</h4>
        <p><b>Author:</b> ${book.author}</p>
        <p><b>Category:</b> ${book.category}</p>
        <p><b>ISBN:</b> ${book.isbn}</p>
        <p><b>Available:</b> ${book.availableCopies}/${book.totalCopies}</p>
        <div class="book-actions">
          <button class="btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary disabled'}" onclick="${isAvailable ? `borrowBook('${book._id}')` : ''}" ${!isAvailable ? 'disabled' : ''}>
            <i class="fas fa-hand-holding"></i> ${isAvailable ? 'Borrow' : 'Unavailable'}
          </button>
          <button class="btn btn-sm btn-info" onclick="viewBookDetails('${book._id}')">
            <i class="fas fa-eye"></i> Details
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function searchBooks() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.category.toLowerCase().includes(searchTerm) ||
    book.isbn.toLowerCase().includes(searchTerm)
  );
  displayBooks(filteredBooks);
}

function updateBookStats() {
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.availableCopies > 0).length;
  const categories = [...new Set(books.map(book => book.category))].length;

  // Update stats if elements exist
  const totalBooksEl = document.getElementById('totalBooks');
  const availableBooksEl = document.getElementById('availableBooks');
  const categoriesEl = document.getElementById('categories');

  if (totalBooksEl) totalBooksEl.textContent = totalBooks;
  if (availableBooksEl) availableBooksEl.textContent = availableBooks;
  if (categoriesEl) categoriesEl.textContent = categories;
}

/* ── Book Actions ── */
async function borrowBook(bookId) {
  if (!confirm('Are you sure you want to borrow this book?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/users/borrow/${bookId}`, {
      method: 'POST',
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      alert('Book borrowed successfully!');
      loadBooks(); // Refresh book list
      loadUserProfile(); // Refresh user profile
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to borrow book');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('Network error. Please try again.');
  }
}

function viewBookDetails(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return;

  const details = `
    Book Details:
    Title: ${book.title}
    Author: ${book.author}
    ISBN: ${book.isbn}
    Category: ${book.category}
    Description: ${book.description || 'No description available'}
    Published: ${book.publishedYear || 'N/A'}
    Publisher: ${book.publisher || 'N/A'}
    Location: ${book.location}
    Available Copies: ${book.availableCopies}/${book.totalCopies}
  `;

  alert(details);
}

/* ── Popups ── */
function openPopup(id) {
  closeAllPopups();
  document.getElementById(id).classList.add('active');
}

function closeAllPopups() {
  document.querySelectorAll('.popup-overlay').forEach(p => p.classList.remove('active'));
}

// Close popup on backdrop click
document.querySelectorAll('.popup-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeAllPopups();
  });
});

function sendRequest() {
  let data = { text: '📚 Request: ' + document.getElementById('reqBook').value + ' by ' + document.getElementById('reqAuthor').value };
  let arr = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  arr.push(data);
  localStorage.setItem('librarianMsg', JSON.stringify(arr));
  closeAllPopups();
  alert('Request Sent Successfully!');
}

function sendHelp() {
  let data = { text: '❗ Help: ' + document.getElementById('helpMsg').value };
  let arr1 = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  let arr2 = JSON.parse(localStorage.getItem('adminMsg')) || [];
  arr1.push(data); arr2.push(data);
  localStorage.setItem('librarianMsg', JSON.stringify(arr1));
  localStorage.setItem('adminMsg', JSON.stringify(arr2));
  closeAllPopups();
  alert('Message Sent!');
}

function sendFeedback() {
  let data = { text: '⭐ Feedback: ' + document.getElementById('feedMsg').value };
  let arr = JSON.parse(localStorage.getItem('adminMsg')) || [];
  arr.push(data);
  localStorage.setItem('adminMsg', JSON.stringify(arr));
  closeAllPopups();
  alert('Feedback Sent!');
}

/* ── Notifications ── */
function toggleNotify() { document.getElementById('notifyBox').classList.toggle('active'); }

function loadNotifications() {
  let teacherMsgs = JSON.parse(localStorage.getItem('studentMsg')) || [];
  let dueAlerts = [{ text: '📚 DSA due tomorrow' }, { text: '💰 Fine ₹10 applied' }];
  let all = [...teacherMsgs, ...dueAlerts];

  document.getElementById('notifyCount').textContent = all.length;

  let list = document.getElementById('notifyList');
  list.innerHTML = '';

  if (all.length === 0) {
    list.innerHTML = '<div class="notify-item">No new notifications</div>';
  } else {
    all.forEach(msg => {
      list.innerHTML += `<div class="notify-item">${msg.text}</div>`;
    });
  }
}

function showError(message) {
  console.error(message);
  alert(message);
}
  let count = document.getElementById('count');
  let list = document.getElementById('notifyList');
  count.innerText = all.length;
  list.innerHTML = '';
  if (all.length === 0) { list.innerHTML = '<p style="color:var(--slate-400);">No notifications</p>'; return; }
  all.slice().reverse().forEach(d => { list.innerHTML += '<p>' + d.text + '</p>'; });
  list.innerHTML += '<button class="btn-mark-read" onclick="markRead()"><i class="fas fa-check-double"></i> Mark All Read</button>';
}

function markRead() { localStorage.removeItem('studentMsg'); loadNotifications(); }

setInterval(loadNotifications, 3000);
window.addEventListener('storage', loadNotifications);
loadNotifications();

function logout() { window.location.href = 'role.html'; }

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.notify-wrapper')) {
    document.getElementById('notifyBox').classList.remove('active');
  }
  if (!e.target.closest('.profile-wrapper')) {
    document.getElementById('profileDrop').classList.remove('active');
  }
});