let books = JSON.parse(localStorage.getItem("books")) || [];

// Seed books if empty
if(books.length === 0) {
  books = [
    {id: "101", title: "Data Structures", author: "Mark Allen", edition: "3rd", subject: "CSE", status: "Available", issueDate: null},
    {id: "102", title: "Automata Theory", author: "Hopcroft", edition: "2nd", subject: "CSE", status: "Issued", issueDate: "2026-03-24T12:00:00Z"},
    {id: "201", title: "Control Systems", author: "Nagrath", edition: "5th", subject: "EEE", status: "Available", issueDate: null},
    {id: "301", title: "Thermodynamics", author: "Rajput", edition: "6th", subject: "MECH", status: "Available", issueDate: null}
  ];
  saveData();
}

function saveData() { localStorage.setItem("books", JSON.stringify(books)); }

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
  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-layer-group"></i> Department Book Categories</h2>
      <p style="color:var(--slate-500); margin-bottom:20px;">Quick overview of books available across university departments.</p>
      
      <div class="books-grid">
        <div class="book-card" onclick="navigate('manage')">
          <img src="assets/img/csebook.jpg" alt="Computer Science">
          <div class="card-content"><h4>Computer Science</h4></div>
        </div>
        <div class="book-card" onclick="navigate('manage')">
          <img src="assets/img/ecebook.jpg" alt="Electronics">
          <div class="card-content"><h4>Electronics</h4></div>
        </div>
        <div class="book-card" onclick="navigate('manage')">
          <img src="assets/img/eeebook.jpg" alt="Electrical">
          <div class="card-content"><h4>Electrical</h4></div>
        </div>
        <div class="book-card" onclick="navigate('manage')">
          <img src="assets/img/mechbook.jpg" alt="Mechanical">
          <div class="card-content"><h4>Mechanical</h4></div>
        </div>
        <div class="book-card" onclick="navigate('manage')">
          <img src="assets/img/civilbook.jpg" alt="Civil Engineering">
          <div class="card-content"><h4>Civil Engg.</h4></div>
        </div>
      </div>
    </div>
  `;
}

function viewManage() {
  let tableRows = books.map((b, i) => `
    <tr>
      <td><span class="badge badge-primary">${b.id}</span></td>
      <td style="font-weight:600;">${b.title}</td>
      <td>${b.author}</td>
      <td>${b.edition}</td>
      <td>${b.subject}</td>
      <td><span class="status ${b.status === 'Available' ? 'avail' : 'issued'}">${b.status}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-secondary btn-sm" onclick="openEditModal(${i})"><i class="fas fa-pen"></i></button>
          <button class="btn-danger btn-sm" onclick="deleteBook(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-plus-circle"></i> Add New Book</h2>
      <div class="form-grid">
        <div class="form-group"><label>Book ID</label><input type="text" class="input" id="newId" placeholder="e.g. 101"></div>
        <div class="form-group"><label>Book Title</label><input type="text" class="input" id="newTitle" placeholder="Data Structures"></div>
        <div class="form-group"><label>Author Name</label><input type="text" class="input" id="newAuthor" placeholder="Author"></div>
        <div class="form-group"><label>Edition</label><input type="text" class="input" id="newEdition" placeholder="3rd"></div>
        <div class="form-group"><label>Subject / Dept</label>
          <select class="input" id="newSubject">
            <option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>CIVIL</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="addBook()"><i class="fas fa-save"></i> Save Book to Inventory</button>
      </div>
    </div>

    <div class="dashboard-section">
      <h2><i class="fas fa-list"></i> Library Inventory</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Author</th><th>Edition</th><th>Subject</th><th>Status</th><th style="text-align:center;">Actions</th></tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="7">No books in inventory.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function viewIssue() {
  let tableRows = books.filter(b => b.status === 'Available').map((b, i) => {
    let globalIndex = books.indexOf(b);
    return `<tr>
      <td><span class="badge badge-primary">${b.id}</span></td>
      <td style="font-weight:600;">${b.title}</td>
      <td>${b.author}</td>
      <td><span class="status avail">${b.status}</span></td>
      <td style="text-align:center;"><button class="btn-accent btn-sm" onclick="issueBook(${globalIndex})"><i class="fas fa-bookmark"></i> Issue Book</button></td>
    </tr>`;
  }).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-hand-holding"></i> Issue Books to Students</h2>
      <p style="color:var(--slate-500); margin-bottom:16px;">Only available books are listed below.</p>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Author</th><th>Status</th><th style="text-align:center;">Action</th></tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="5">No books available to issue at the moment.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function viewReturn() {
  let tableRows = books.filter(b => b.status === 'Issued').map((b, i) => {
    let globalIndex = books.indexOf(b);
    
    // Fine calc
    let issueDate = new Date(b.issueDate);
    let today = new Date();
    let days = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24));
    let fine = days > 7 ? (days - 7) * 10 : 0;
    let fineText = fine > 0 ? `<span style="color:var(--danger);font-weight:bold;">₹${fine}</span>` : 'None';
    
    return `<tr>
      <td><span class="badge badge-primary">${b.id}</span></td>
      <td style="font-weight:600;">${b.title}</td>
      <td>${new Date(b.issueDate).toLocaleDateString()}</td>
      <td>${fineText}</td>
      <td style="text-align:center;"><button class="btn-primary btn-sm" onclick="returnBook(${globalIndex})"><i class="fas fa-undo"></i> Accept Return</button></td>
    </tr>`;
  }).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
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