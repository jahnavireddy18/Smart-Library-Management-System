/* ── Profile ── */
function toggleProfile() { document.getElementById('profileDrop').classList.toggle('active'); }
function openProfile() { document.getElementById('profileDrop').classList.add('active'); }

function enableEdit() { document.querySelectorAll('#profileDrop input').forEach(i => i.disabled = false); }

function saveProfile() {
  let profile = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    branch: document.getElementById('branch').value,
    img: document.getElementById('profileImg').src
  };
  localStorage.setItem('studentProfile', JSON.stringify(profile));
  loadProfile();
  document.querySelectorAll('#profileDrop input').forEach(i => i.disabled = true);
}

function loadProfile() {
  let p = JSON.parse(localStorage.getItem('studentProfile'));
  if (!p) return;
  document.getElementById('pname').innerText = p.name;
  document.getElementById('pemail').innerText = p.email;
  document.getElementById('name').value = p.name;
  document.getElementById('email').value = p.email;
  document.getElementById('phone').value = p.phone;
  document.getElementById('branch').value = p.branch;
  if (p.img) {
    document.getElementById('profileImg').src = p.img;
    document.getElementById('topProfileImg').src = p.img;
  }
}
loadProfile();

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

/* ── Books ── */
const books = [
  { title: "DSA", author: "Mark", subject: "Algorithms", id: "1", img: "datastructures.jpeg" },
  { title: "Python", author: "Guido", subject: "Programming", id: "2", img: "python.jpeg" },
  { title: "Java", author: "James", subject: "Programming", id: "3", img: "java.jpeg" },
  { title: "C++", author: "Bjarne", subject: "Programming", id: "4", img: "c++.jpeg" },
  { title: "C", author: "Dennis", subject: "Programming", id: "5", img: "c.jpeg" },
  { title: "OS", author: "Silberschatz", subject: "System", id: "6", img: "os.png" },
  { title: "DBMS", author: "Korth", subject: "Database", id: "7", img: "dbms.jpeg" },
  { title: "CN", author: "Tanenbaum", subject: "Networking", id: "8", img: "cn.jpg" },
  { title: "AI", author: "Russell", subject: "AI", id: "9", img: "ai.jpg" },
  { title: "ML", author: "Tom", subject: "AI", id: "10", img: "machinelearning.jpg" },
  { title: "JS", author: "Brendan", subject: "Web", id: "11", img: "js.jpeg" },
  { title: "HTML", author: "W3C", subject: "Web", id: "12", img: "html.jpg" },
  { title: "CSS", author: "W3C", subject: "Web", id: "13", img: "css.jpg" },
  { title: "React", author: "Meta", subject: "Web", id: "14", img: "react.jpg" },
  { title: "Node", author: "Ryan", subject: "Backend", id: "15", img: "node.jpg" },
  { title: "Django", author: "Adrian", subject: "Backend", id: "16", img: "django.jpg" },
  { title: "Flask", author: "Armin", subject: "Backend", id: "17", img: "flask.jpg" },
  { title: "Android", author: "Google", subject: "Mobile", id: "18", img: "android.jpg" },
  { title: "Swift", author: "Apple", subject: "Mobile", id: "19", img: "swift.jpg" },
  { title: "Kotlin", author: "JetBrains", subject: "Mobile", id: "20", img: "kotlin.jpg" }
];

function displayBooks(list) {
  const c = document.getElementById('bookContainer');
  c.innerHTML = '';
  list.forEach(b => {
    c.innerHTML += `
      <div class="book-card">
        <img src="assets/img/${b.img}" alt="${b.title}">
        <div class="card-body">
          <h4>${b.title}</h4>
          <p><b>Author:</b> ${b.author}</p>
          <p><b>Subject:</b> ${b.subject}</p>
          <p><b>ID:</b> ${b.id}</p>
        </div>
      </div>`;
  });
}
displayBooks(books);

function searchBooks() {
  let v = document.getElementById('searchInput').value.toLowerCase();
  displayBooks(books.filter(b =>
    b.title.toLowerCase().includes(v) ||
    b.author.toLowerCase().includes(v) ||
    b.subject.toLowerCase().includes(v) ||
    b.id.includes(v)
  ));
}

/* ── Notifications ── */
function toggleNotify() { document.getElementById('notifyBox').classList.toggle('active'); }

function loadNotifications() {
  let teacherMsgs = JSON.parse(localStorage.getItem('studentMsg')) || [];
  let dueAlerts = [{ text: '📚 DSA due tomorrow' }, { text: '💰 Fine ₹10 applied' }];
  let all = [...teacherMsgs, ...dueAlerts];
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