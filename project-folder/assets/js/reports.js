// Simulate dynamic report fetching from local storage
let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];

document.getElementById('repUsers').innerText = users.length || 150; // Fallbacks if empty
document.getElementById('repInv').innerText = books.length || 420;

let issued = books.filter(b => b.status === "Issued").length || 85;
let avail = books.filter(b => b.status === "Available").length || 335;

document.getElementById('repIss').innerText = issued;
document.getElementById('repAvail').innerText = avail;
document.getElementById('donutTotal').innerText = books.length || 420;