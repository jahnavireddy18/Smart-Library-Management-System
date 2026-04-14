// Librarian Dashboard - Real Data Integration
let books = [];

document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
  if (contentArea) {
    contentArea.innerHTML = `
      <div class="dashboard-section">
        <h2>Loading librarian dashboard...</h2>
        <p>Please wait while the dashboard loads.</p>
      </div>
    `;
  }
  loadBooks();
  updateNotifyIcon();
});

function checkAuthentication() {
  const auth = checkRole('librarian');
  if (!auth) return false;

  const user = JSON.parse(localStorage.getItem('user'));
  const nameEl = document.getElementById('librarianName');
  if (nameEl) {
    nameEl.textContent = user.name;
  }

  return true;
}

async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');

    if (response.ok) {
      books = await response.json();
      console.log('Loaded books:', books);
    } else {
      throw new Error('Failed to fetch books');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
    showError('Failed to load books from database');
  } finally {
    viewHome();
  }
}

function saveData() {
  // No longer needed since we're using real database
  console.log('Data saved to database via API');
}

/* Panel functions */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function navigate(view) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');

  if(view === 'home') viewHome();
  if(view === 'manage') viewManage();
  if(view === 'issue') viewIssue();
  if(view === 'return') viewReturn();
}

/* Notification functions */
function updateNotifyIcon() {
  let libMsgs = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  let recMsgs = JSON.parse(localStorage.getItem('recommendations')) || [];
  document.getElementById('notifyCount').innerText = libMsgs.length + recMsgs.length;
}

function toggleNotify() {
  let box = document.getElementById("notifyBox");
  box.classList.toggle('active');

  if (box.classList.contains('active')) {
    let list = document.getElementById('notifyList');
    list.innerHTML = "";

    let libMsgs = JSON.parse(localStorage.getItem('librarianMsg')) || [];
    let recMsgs = JSON.parse(localStorage.getItem('recommendations')) || [];

    if (libMsgs.length === 0 && recMsgs.length === 0) {
      list.innerHTML = `<div class="notify-item">No new messages or requests.</div>`;
    } else {
      libMsgs.forEach(m => list.innerHTML += `<div class="notify-item"><i class="fas fa-info-circle" style="color:var(--primary-500);margin-right:8px;"></i>${m.text}</div>`);
      recMsgs.forEach(m => list.innerHTML += `<div class="notify-item"><i class="fas fa-book" style="color:var(--accent-500);margin-right:8px;"></i>Request: ${m.book} by ${m.author}</div>`);
    }
  }
}

function clearNotify() {
  localStorage.removeItem('librarianMsg');
  localStorage.removeItem('recommendations');
  updateNotifyIcon();
  toggleNotify();
}

/* Views */
const contentArea = document.getElementById("contentArea");

function viewHome() {
  console.log('viewHome called with books:', books);
  // Get unique categories from real books
  const categories = [...new Set(books.map(book => book.category))];
  console.log('Categories found:', categories);

  const categoryCards = categories.map(category => {
    const categoryBooks = books.filter(book => book.category === category);
    const availableCount = categoryBooks.filter(book => book.availableCopies > 0).length;

    // Map category names to available images
    const imageMap = {
      'Computer Science': 'computer.jpg',
      'Programming': 'csebook.jpg',
      'Web Development': 'web.jpg',
      'AI': 'ai.jpg',
      'Machine Learning': 'machinelearning.jpg',
      'Database': 'dbms.jpeg',
      'Security': 'cyber.jpg'
    };

    const imageName = imageMap[category] || 'book-placeholder.jpg';

    return `
      <div class="book-card" onclick="showCategoryBooks('${category}')">
        <img src="assets/img/${imageName}" alt="${category}" onerror="this.src='assets/img/logo.jpg'">
        <div class="card-content">
          <h4>${category}</h4>
          <p>${availableCount}/${categoryBooks.length} available</p>
        </div>
      </div>
    `;
  }).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-layer-group"></i> Department Book Categories</h2>
      <p style="color:var(--slate-500); margin-bottom:20px;">Quick overview of books available across university departments.</p>

      <div class="books-grid">
        ${categoryCards || '<p>No book categories found. Please check if books are loaded from the database.</p>'}
      </div>
    </div>
  `;
}

function showCategoryBooks(category) {
  const categoryBooks = books.filter(book => book.category === category);

  const bookList = categoryBooks.map(book => `
    <div class="book-item">
      <div class="book-info">
        <h4>${book.title}</h4>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Available:</strong> ${book.availableCopies}/${book.totalCopies}</p>
        <p><strong>Location:</strong> ${book.location}</p>
      </div>
      <div class="book-actions">
        <button class="btn btn-sm btn-primary" onclick="viewBook('${book._id}')">View Details</button>
      </div>
    </div>
  `).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-books"></i> ${category} Books</h2>
      <button class="btn btn-secondary" onclick="viewHome()" style="margin-bottom: 20px;">
        <i class="fas fa-arrow-left"></i> Back to Categories
      </button>

      <div class="books-list">
        ${bookList || '<p>No books in this category.</p>'}
      </div>
    </div>
  `;
}

function viewManage() {
  const tableRows = books.map((book) => `
    <tr>
      <td><span class="badge badge-primary">${book.isbn}</span></td>
      <td style="font-weight:600;">${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td><span class="status ${book.availableCopies > 0 ? 'avail' : 'issued'}">${book.availableCopies > 0 ? 'Available' : 'Unavailable'}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-secondary btn-sm" onclick="editBook('${book._id}')"><i class="fas fa-pen"></i></button>
          <button class="btn-danger btn-sm" onclick="deleteBook('${book._id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-plus-circle"></i> Add New Book</h2>
      <div class="form-grid">
        <div class="form-group"><label>Title</label><input type="text" class="input" id="newTitle" placeholder="Book Title"></div>
        <div class="form-group"><label>Author</label><input type="text" class="input" id="newAuthor" placeholder="Author Name"></div>
        <div class="form-group"><label>ISBN</label><input type="text" class="input" id="newIsbn" placeholder="ISBN"></div>
        <div class="form-group"><label>Category</label>
          <select class="input" id="newCategory">
            <option>Computer Science</option><option>Programming</option><option>Database</option><option>AI</option><option>Machine Learning</option><option>Web Development</option><option>Security</option>
          </select>
        </div>
        <div class="form-group"><label>Total Copies</label><input type="number" class="input" id="newCopies" placeholder="1" min="1"></div>
        <div class="form-group"><label>Location</label><input type="text" class="input" id="newLocation" placeholder="Shelf A1"></div>
        <div class="form-group"><label>Published Year</label><input type="number" class="input" id="newYear" placeholder="2023"></div>
        <div class="form-group"><label>Publisher</label><input type="text" class="input" id="newPublisher" placeholder="Publisher"></div>
      </div>
      <div class="form-group full-width">
        <label>Description</label>
        <textarea class="input" id="newDescription" placeholder="Book description" rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="addBook()"><i class="fas fa-save"></i> Save Book to Inventory</button>
      </div>
    </div>

    <div class="dashboard-section">
      <h2><i class="fas fa-list"></i> Library Inventory (${books.length} books)</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Status</th><th style="text-align:center;">Actions</th></tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="7">No books in inventory.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function addBook() {
  const bookData = {
    title: document.getElementById('newTitle').value,
    author: document.getElementById('newAuthor').value,
    isbn: document.getElementById('newIsbn').value,
    category: document.getElementById('newCategory').value,
    description: document.getElementById('newDescription').value,
    totalCopies: parseInt(document.getElementById('newCopies').value),
    location: document.getElementById('newLocation').value,
    publishedYear: parseInt(document.getElementById('newYear').value),
    publisher: document.getElementById('newPublisher').value
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
      await loadBooks(); // Refresh books
      viewManage(); // Refresh view
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
      await loadBooks(); // Refresh books
      viewManage(); // Refresh view
    } else {
      alert('Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Network error. Please try again.');
  }
}

function viewIssue() {
  const availableBooks = books.filter(book => book.availableCopies > 0);

  const tableRows = availableBooks.map((book) => `
    <tr>
      <td><span class="badge badge-primary">${book.isbn}</span></td>
      <td style="font-weight:600;">${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td><span class="status avail">Available (${book.availableCopies})</span></td>
      <td style="text-align:center;">
        <button class="btn-accent btn-sm" onclick="issueBook('${book._id}')">
          <i class="fas fa-bookmark"></i> Issue Book
        </button>
      </td>
    </tr>
  `).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-hand-holding"></i> Issue Books to Students</h2>
      <p style="color:var(--slate-500); margin-bottom:16px;">Only available books are listed below.</p>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Status</th><th style="text-align:center;">Action</th></tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="6">No books available to issue at the moment.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function viewReturn() {
  // For now, show a placeholder - would need to implement borrowing history
  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-undo"></i> Return Books</h2>
      <p style="color:var(--slate-500); margin-bottom:16px;">Book return functionality will be implemented with borrowing history.</p>
      <div class="placeholder-message">
        <i class="fas fa-clock" style="font-size: 48px; color: var(--slate-400);"></i>
        <p>Return functionality coming soon...</p>
      </div>
    </div>
  `;
}

// Placeholder functions
function issueBook(bookId) {
  alert('Book issuing functionality will be implemented with user selection');
}

function editBook(bookId) {
  alert('Book editing functionality coming soon');
}

function viewBook(bookId) {
  alert('Book details view coming soon');
}

function showError(message) {
  console.error(message);
  alert(message);
}
      <h2><i class="fas fa-undo"></i> Return Issued Books & Collect Fines</h2>
      <p style="color:var(--slate-500); margin-bottom:16px;">System calculates ₹10/day fine after 7 days automatically.</p>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr><th>Book ID</th><th>Title</th><th>Issued On</th><th>Late Fine Due</th><th style="text-align:center;">Action</th></tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="5">No books are currently issued.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* Actions */
function addBook() {
  let id = document.getElementById('newId').value;
  let title = document.getElementById('newTitle').value;
  let auth = document.getElementById('newAuthor').value;
  let ed = document.getElementById('newEdition').value;
  let sub = document.getElementById('newSubject').value;
  
  if(!id || !title || !auth) { alert("ID, Title, and Author are required."); return; }
  
  // Check dup ID
  if(books.find(b => b.id === id)) { alert("Book ID already exists!"); return; }
  
  books.push({ id, title, author: auth, edition: ed, subject: sub, status: "Available", issueDate: null });
  saveData();
  viewManage();
}

function deleteBook(i) {
  if(confirm('Are you sure you want to delete this book?')) {
    books.splice(i, 1);
    saveData();
    viewManage();
  }
}

function openEditModal(i) {
  let modal = document.getElementById('editModal');
  document.getElementById('editIndex').value = i;
  let b = books[i];
  
  document.getElementById('eid').value = b.id;
  document.getElementById('etitle').value = b.title;
  document.getElementById('eauthor').value = b.author;
  document.getElementById('eedition').value = b.edition;
  document.getElementById('esubject').value = b.subject;
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

function saveEdit() {
  let i = document.getElementById('editIndex').value;
  books[i].title = document.getElementById('etitle').value;
  books[i].author = document.getElementById('eauthor').value;
  books[i].edition = document.getElementById('eedition').value;
  books[i].subject = document.getElementById('esubject').value;
  saveData();
  closeModal();
  viewManage();
}

function issueBook(i) {
  books[i].status = "Issued";
  books[i].issueDate = new Date().toISOString();
  saveData();
  viewIssue();
  
  /* Success overlay */
  let div = document.createElement('div');
  div.style.cssText = "position:fixed;top:20px;right:20px;background:var(--success);color:#fff;padding:12px 20px;border-radius:6px;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
  div.innerHTML = `<i class="fas fa-check-circle"></i> Book Issued Successfully`;
  document.body.appendChild(div);
  setTimeout(()=> div.remove(), 2500);
}

function returnBook(i) {
  let b = books[i];
  let days = Math.floor((new Date() - new Date(b.issueDate)) / (1000 * 60 * 60 * 24));
  let msg = "Book Returned successfully.";
  
  if (days > 7) {
    let amt = (days - 7) * 10;
    msg += ` Collected Fine: ₹${amt}`;
    alert(`Please collect late fine of ₹${amt} before returning.`);
  }
  
  b.status = "Available";
  b.issueDate = null;
  saveData();
  viewReturn();
  
  /* Success overlay */
  let div = document.createElement('div');
  div.style.cssText = "position:fixed;top:20px;right:20px;background:var(--success);color:#fff;padding:12px 20px;border-radius:6px;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
  div.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  document.body.appendChild(div);
  setTimeout(()=> div.remove(), 2500);
}

/* App Init */
window.addEventListener('storage', updateNotifyIcon);
updateNotifyIcon();
viewHome();