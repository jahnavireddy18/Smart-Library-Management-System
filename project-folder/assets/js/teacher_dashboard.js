let historyData = [];
let currentDeptData = [];
let currentDeptName = "";

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
  currentDeptData = [];
  document.getElementById('deptTableContainer').style.display = 'block';
  document.getElementById('deptTitle').innerHTML = `<i class="fas ${iconClass}"></i> ${dept} Books`;
  
  // Setup dummy data
  for(let i=1; i<=15; i++) {
    let available = Math.random() > 0.4;
    currentDeptData.push({
      id: dept + "-" + (i < 10 ? "0" + i : i),
      title: dept + " Subject Fundamentals Vol " + i,
      author: "Professor " + String.fromCharCode(64 + i),
      due: Math.floor(Math.random()*30) + 1,
      status: available ? "Available" : "Unavailable"
    });
  }
  
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
        <th>Book ID</th>
        <th>Title</th>
        <th>Author</th>
        <th>Due Within (Days)</th>
        <th>Status</th>
        <th style="text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  let rows = "";
  if (data.length === 0) {
    rows = `<tr><td colspan="6" style="padding:20px;">No books match your search.</td></tr>`;
  } else {
    data.forEach(b => {
      let isAvail = b.status === "Available";
      let statusClass = isAvail ? "status-avail" : "status-unavail";
      
      let borrowBtn = isAvail 
        ? `<button class="btn-accent btn-sm" onclick="borrow('${b.title}')"><i class="fas fa-hand-holding"></i> Borrow</button>`
        : `<button class="btn-accent btn-sm btn-disabled" disabled><i class="fas fa-hand-holding"></i> Borrow</button>`;
        
      rows += `
        <tr>
          <td><span class="badge badge-primary">${b.id}</span></td>
          <td style="font-weight:600; color:var(--slate-800);">${b.title}</td>
          <td>${b.author}</td>
          <td>${b.due} Days</td>
          <td class="${statusClass}"><i class="fas ${isAvail ? 'fa-check' : 'fa-times'}"></i> ${b.status}</td>
          <td style="text-align:center;">
            <button class="btn-primary btn-sm" onclick="reserve('${b.title}')"><i class="fas fa-bookmark"></i> Reserve</button>
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
  let filtered = currentDeptData.filter(b => 
    b.title.toLowerCase().includes(val) || 
    b.author.toLowerCase().includes(val) || 
    b.id.toLowerCase().includes(val)
  );
  renderTable(filtered);
}

function filterStatus(status) {
  if (status === "All") { renderTable(currentDeptData); return; }
  let filtered = currentDeptData.filter(b => b.status === status);
  renderTable(filtered);
}

function sortData(type) {
  let sorted = [...currentDeptData];
  if(type === "id") { sorted.sort((a,b) => a.id.localeCompare(b.id)); }
  if(type === "title") { sorted.sort((a,b) => a.title.localeCompare(b.title)); }
  if(type === "due") { sorted.sort((a,b) => a.due - b.due); }
  renderTable(sorted);
}

/* History Logic */
function reserve(b) { historyData.unshift(`<i class="fas fa-bookmark" style="color:var(--primary-500);margin-right:8px;"></i> Reserved "${b}" successfully.`); updateHistory(); }
function borrow(b) { historyData.unshift(`<i class="fas fa-hand-holding" style="color:var(--accent-500);margin-right:8px;"></i> Borrowed "${b}" securely.`); updateHistory(); }

function updateHistory() {
  let hl = document.getElementById('historyList');
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
  if(!title || !author) return;
  
  let recs = JSON.parse(localStorage.getItem("recommendations")) || [];
  recs.push({book: title, author: author});
  localStorage.setItem("recommendations", JSON.stringify(recs));
  
  document.getElementById('recBook').value = "";
  document.getElementById('recAuthor').value = "";
  
  let msg = document.getElementById('recMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

/* Notifications Setup */
function sendMsg(role) {
  let msg = document.getElementById('notifyMsg').value;
  if(!msg) return;
  
  let key = role + "Msg";
  let data = JSON.parse(localStorage.getItem(key)) || [];
  data.push({text: "🧑‍🏫 Teacher: " + msg});
  localStorage.setItem(key, JSON.stringify(data));
  
  document.getElementById('notifyMsg').value = "";
  let status = document.getElementById('notifyStatus');
  status.innerHTML = `<i class="fas fa-check-circle"></i> Sent to ${role}!`;
  status.style.display = 'block';
  setTimeout(() => status.style.display = 'none', 3000);
}