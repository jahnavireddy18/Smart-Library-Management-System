// Shared Voice Assistant for all pages
document.addEventListener('DOMContentLoaded', () => {
  initVoiceAssistant();
});

function initVoiceAssistant() {
  // Create voice button if it doesn't exist
  let voiceBtn = document.getElementById('voiceBtn');
  if (!voiceBtn) {
    voiceBtn = document.createElement('button');
    voiceBtn.id = 'voiceBtn';
    voiceBtn.className = 'voice-btn';
    voiceBtn.title = 'Voice Assistant';
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';

    // Add to header if it exists
    const header = document.querySelector('.site-header, header');
    if (header) {
      header.appendChild(voiceBtn);
    } else {
      // Add to body if no header
      document.body.appendChild(voiceBtn);
    }
  }

  let recognition;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      voiceBtn.classList.add('listening');
      speak('Listening for your command...');
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(command);
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      speak('Sorry, I didn\'t catch that. Please try again.');
      voiceBtn.classList.remove('listening');
    };

    voiceBtn.addEventListener('click', () => {
      if (recognition) {
        recognition.start();
      }
    });
  } else {
    voiceBtn.style.display = 'none';
    console.warn('Speech recognition not supported in this browser.');
  }
}

function handleVoiceCommand(command) {
  console.log('Voice command:', command);

  // Page navigation commands
  if (command.includes('home') || command.includes('go to home') || command.includes('main page')) {
    navigateToPage('index.html');
    speak('Going to home page.');
  } else if (command.includes('login') || command.includes('sign in')) {
    navigateToPage('role.html');
    speak('Opening role selection page.');
  } else if (command.includes('role') || command.includes('select role')) {
    navigateToPage('role.html');
    speak('Opening role selection page.');
  } else if (command.includes('student dashboard') || command.includes('student page')) {
    navigateToPage('student_dashboard.html');
    speak('Opening student dashboard.');
  } else if (command.includes('teacher dashboard') || command.includes('teacher page')) {
    navigateToPage('teacher_dashboard.html');
    speak('Opening teacher dashboard.');
  } else if (command.includes('librarian dashboard') || command.includes('librarian page')) {
    navigateToPage('librarian_dashboard.html');
    speak('Opening librarian dashboard.');
  } else if (command.includes('admin dashboard') || command.includes('admin page')) {
    navigateToPage('admin_dashboard.html');
    speak('Opening admin dashboard.');
  } else if (command.includes('library') || command.includes('books')) {
    navigateToPage('library.html');
    speak('Opening library page.');
  } else if (command.includes('reports') || command.includes('report')) {
    navigateToPage('reports.html');
    speak('Opening reports page.');
  } else if (command.includes('backup') || command.includes('back up')) {
    navigateToPage('backup.html');
    speak('Opening backup page.');
  }

  // Page-specific commands
  else if (command.includes('search') || command.includes('find')) {
    handleSearchCommand(command);
  } else if (command.includes('theme') || command.includes('dark') || command.includes('light')) {
    handleThemeCommand();
  } else if (command.includes('scroll to top') || command.includes('top')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    speak('Scrolled to top.');
  } else if (command.includes('help') || command.includes('commands')) {
    speak('You can say: go to home, login, student dashboard, teacher dashboard, librarian dashboard, admin dashboard, library, reports, backup. Also: search for books, toggle theme, scroll to top, or help.');
  } else if (command.includes('logout') || command.includes('sign out')) {
    handleLogout();
  } else {
    speak('Sorry, I didn\'t understand that command. Say "help" for available commands.');
  }
}

function navigateToPage(page) {
  window.location.href = page;
}

function handleSearchCommand(command) {
  const searchTerm = command.replace(/search|find/gi, '').trim();
  if (searchTerm) {
    // Try to find search input on current page
    const searchInput = document.getElementById('searchInput') || document.querySelector('input[type="search"]') || document.querySelector('input[placeholder*="search"]');
    if (searchInput) {
      searchInput.value = searchTerm;
      searchInput.focus();

      // Try to trigger search
      const searchBtn = document.getElementById('searchBtn') || document.querySelector('button[type="submit"]') || document.querySelector('button[onclick*="search"]');
      if (searchBtn) {
        searchBtn.click();
      } else {
        // Trigger enter key on input
        const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        searchInput.dispatchEvent(enterEvent);
      }

      speak(`Searching for "${searchTerm}".`);
    } else {
      speak('Search functionality not available on this page.');
    }
  } else {
    speak('What would you like to search for?');
  }
}

function handleThemeCommand() {
  const toggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.click();
    speak('Theme toggled.');
  } else {
    // Try to toggle body class directly
    document.body.classList.toggle('light');
    speak('Theme toggled.');
  }
}

function handleLogout() {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Use the logout function if available (from auth.js), otherwise manual logout
  if (typeof logout === 'function') {
    logout();
  } else {
    // Navigate to role selection page
    navigateToPage('role.html');
  }

  speak('Logged out successfully.');
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}

// Add voice button styles if not already present
if (!document.querySelector('#voice-assistant-styles')) {
  const styles = document.createElement('style');
  styles.id = 'voice-assistant-styles';
  styles.textContent = `
    .voice-btn {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10;
      position: relative;
    }

    .voice-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: scale(1.1);
    }

    .voice-btn.listening {
      background: var(--primary-600, #6366f1);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    /* Position in header */
    .site-header .voice-btn {
      margin-left: 10px;
    }
  `;
  document.head.appendChild(styles);
}