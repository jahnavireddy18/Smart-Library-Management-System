// Navigation active state
const navLinks = document.querySelectorAll('[data-nav]');
navLinks.forEach(link => {
  link.addEventListener('click', function () {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Scroll spy
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    const top = s.offsetTop - 150;
    if (scrollY >= top) current = s.getAttribute('id');
  });
  
  // Force contact section to be active if scrolled to very bottom
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
    current = 'contact';
  }

  navLinks.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
});

// Theme toggle
const toggle = document.getElementById('themeToggle');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  document.body.classList.toggle('light');
});