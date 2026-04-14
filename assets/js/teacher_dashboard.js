// Teacher Dashboard - Real Data Integration
let books = [];
let currentDeptData = [];
let currentDeptName = "";
let historyData = [];

document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
  loadBooks();
  loadUserProfile();
  updateHistory();
});

function checkAuthentication() {
  const auth = checkRole('teacher');
  if (!auth) return;

  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('teacherName').textContent = user.name;
  document.getElementById('teacherEmail').textContent = user.email;
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
  // Update profile info if elements exist
  const nameEl = document.getElementById('teacherName');
  const emailEl = document.getElementById('teacherEmail');

  if (nameEl) nameEl.textContent = profile.name;
  if (emailEl) emailEl.textContent = profile.email;

  // Update borrowed books count
  const borrowedCount = profile.borrowedBooks ? profile.borrowedBooks.length : 0;
  const borrowedEl = document.getElementById('borrowedBooksCount');
  if (borrowedEl) borrowedEl.textContent = borrowedCount;

  // Update fines
  const finesEl = document.getElementById('finesAmount');
  if (finesEl) finesEl.textContent = `₹${profile.fines || 0}`;
}

/* ── Books ── */
async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');

    if (response.ok) {
      books = await response.json();
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

/* Side Panel */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

/* Nav */
function showDashboard() {
  window.scrollTo({top:0, behavior:'smooth'});
}

function scrollToID(id) {
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

/* Department Data Generation */
function showDept(dept, iconClass) {
  currentDeptName = dept;
  currentDeptData = books.filter(book => book.category === dept);

  document.getElementById('deptTableContainer').style.display = 'block';
  document.getElementById('deptTitle').innerHTML = `<i class="fas ${iconClass}"></i> ${dept} Books`;

  renderTable(currentDeptData);
  document.getElementById('deptTableContainer').scrollIntoView({behavior:'smooth', block:'start'});
}

function hideDept() {
  document.getElementById('deptTableContainer').style.display = 'none';
}

function renderTable(data) {
  let table = document.getElementById('deptTableArea');
  let header = `
    <thead>
      <tr>
        <th>ISBN</th>
        <th>Title</th>
        <th>Author</th>
        <th>Available</th>
        <th>Status</th>
        <th style="text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody>
  `;

  let rows = "";
  if (data.length === 0) {
    rows = `<tr><td colspan="6" style="padding:20px;">No books found in this category.</td></tr>`;
  } else {
    data.forEach(book => {
      let isAvail = book.availableCopies > 0;
      let statusClass = isAvail ? "status-avail" : "status-unavail";
      let statusText = isAvail ? "Available" : "Unavailable";

      let borrowBtn = isAvail
        ? `<button class="btn-accent btn-sm" onclick="borrowBook('${book._id}', '${book.title}')"><i class="fas fa-hand-holding"></i> Borrow</button>`
        : `<button class="btn-accent btn-sm btn-disabled" disabled><i class="fas fa-hand-holding"></i> Borrow</button>`;

      rows += `
        <tr>
          <td><span class="badge badge-primary">${book.isbn}</span></td>
          <td style="font-weight:600; color:var(--slate-800);">${book.title}</td>
          <td>${book.author}</td>
          <td>${book.availableCopies}/${book.totalCopies}</td>
          <td class="${statusClass}"><i class="fas ${isAvail ? 'fa-check' : 'fa-times'}"></i> ${statusText}</td>
          <td style="text-align:center;">
            <button class="btn-primary btn-sm" onclick="reserveBook('${book._id}', '${book.title}')"><i class="fas fa-bookmark"></i> Reserve</button>
            ${borrowBtn}
          </td>
        </tr>
      `;
    });
  }

  table.innerHTML = header + rows + "</tbody>";
}

/* Filters & Sorting */
function applyFilters(val) {
  val = val.toLowerCase();
  let filtered = currentDeptData.filter(book =>
    book.title.toLowerCase().includes(val) ||
    book.author.toLowerCase().includes(val) ||
    book.isbn.toLowerCase().includes(val)
  );
  renderTable(filtered);
}

function filterStatus(status) {
  if (status === "All") {
    renderTable(currentDeptData);
    return;
  }

  let filtered = currentDeptData.filter(book => {
    if (status === "Available") return book.availableCopies > 0;
    if (status === "Unavailable") return book.availableCopies === 0;
    return true;
  });
  renderTable(filtered);
}

function sortData(type) {
  let sorted = [...currentDeptData];
  if(type === "id") { sorted.sort((a,b) => a.isbn.localeCompare(b.isbn)); }
  if(type === "title") { sorted.sort((a,b) => a.title.localeCompare(b.title)); }
  if(type === "due") { sorted.sort((a,b) => b.availableCopies - a.availableCopies); }
  renderTable(sorted);
}

/* Book Actions */
async function borrowBook(bookId, bookTitle) {
  if (!confirm(`Are you sure you want to borrow "${bookTitle}"?`)) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/users/borrow/${bookId}`, {
      method: 'POST',
      headers: {
        'x-auth-token': token
      }
    });

    if (response.ok) {
      alert(`"${bookTitle}" borrowed successfully!`);
      historyData.unshift(`<i class="fas fa-hand-holding" style="color:var(--accent-500);margin-right:8px;"></i> Borrowed "${bookTitle}" successfully.`);
      updateHistory();
      loadBooks(); // Refresh books
      if (currentDeptData.length > 0) {
        renderTable(currentDeptData); // Refresh current table
      }
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to borrow book');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('Network error. Please try again.');
  }
}

function reserveBook(bookId, bookTitle) {
  historyData.unshift(`<i class="fas fa-bookmark" style="color:var(--primary-500);margin-right:8px;"></i> Reserved "${bookTitle}" successfully.`);
  updateHistory();
  alert(`"${bookTitle}" has been reserved!`);
}

/* History Logic */
function updateHistory() {
  let hl = document.getElementById('historyList');
  if (!hl) return;

  hl.innerHTML = "";
  historyData.forEach(x => {
    let div = document.createElement('div');
    div.className = "history-item animate-fadeInUp";
    div.innerHTML = x + ` <span style="float:right; font-size:11px; color:var(--slate-400);">Just now</span>`;
    hl.appendChild(div);
  });
}

/* Recommended Books */
function recommend() {
  let title = document.getElementById('recBook').value;
  let author = document.getElementById('recAuthor').value;
  if(!title || !author) {
    alert('Please fill both title and author');
    return;
  }

  let recs = JSON.parse(localStorage.getItem("recommendations")) || [];
  recs.push({book: title, author: author});
  localStorage.setItem("recommendations", JSON.stringify(recs));

  document.getElementById('recBook').value = "";
  document.getElementById('recAuthor').value = "";

  let msg = document.getElementById('recMsg');
  if (msg) {
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
  }

  alert('Book recommendation sent to librarian!');
}

/* Notifications Setup */
function sendMsg(role) {
  let msg = document.getElementById('notifyMsg').value;
  if(!msg) {
    alert('Please enter a message');
    return;
  }

  let key = role + "Msg";
  let data = JSON.parse(localStorage.getItem(key)) || [];
  data.push({text: "🧑‍🏫 Teacher: " + msg});
  localStorage.setItem(key, JSON.stringify(data));

  document.getElementById('notifyMsg').value = "";
  let status = document.getElementById('notifyStatus');
  if (status) {
    status.innerHTML = `<i class="fas fa-check-circle"></i> Sent to ${role}!`;
    status.style.display = 'block';
    setTimeout(() => status.style.display = 'none', 3000);
  }

  alert(`Message sent to ${role}!`);
}

function showError(message) {
  console.error(message);
  alert(message);
}