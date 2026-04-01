function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function openModal() {
  document.getElementById('addUserModal').classList.add('active');
}

function closeModal() {
  document.getElementById('addUserModal').classList.remove('active');
}

// Close on backdrop
document.getElementById('addUserModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function addUser() {
  let user = {
    id: document.getElementById('uid').value,
    name: document.getElementById('uname').value,
    role: document.getElementById('urole').value,
    dept: document.getElementById('dept').value,
    year: document.getElementById('year').value
  };

  if(!user.id || !user.name) {
    alert('Please fill all required fields');
    return;
  }

  let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
  users.push(user);
  localStorage.setItem('libraryUsers', JSON.stringify(users));

  alert('User Added Successfully');
  
  // Clear inputs
  document.querySelectorAll('#addUserModal .input').forEach(i => i.value = '');
  closeModal();
}