//Constants
const weddingDate = new Date("April 25, 2026 16:00:00").getTime(); // Date of the wedding

//Functions

//Countdown function
function updateCountdown() {
  const now = new Date().getTime(); // Current date and time
  const distance = weddingDate - now;

    // Check if the current date is after the wedding date
    try {
        now > weddingDate
    } catch (error) {
        console.error("Wedding date can't be prior to current date:", error);
    }
  

  if (distance <= 0) {
    document.getElementById("countdown").innerHTML = "¡Es hoy!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}
setInterval(updateCountdown, 1000);

//showContent function with nav active state
function showContent(section) {
  // Hide all content sections
  const sections = ['home', 'rsvp', 'photos', 'questions'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Show the selected section
  const selected = document.getElementById(section);
  if (selected) selected.style.display = 'flex';

  // Nav active state: use link text or href as fallback
  const navLinks = document.querySelectorAll('.li-format');
  navLinks.forEach(link => link.classList.remove('active'));
  // Try to find link by matching a data-section attribute (more robust) or fallback to href
  let activeLink = document.querySelector(`.li-format[data-section="${section}"]`);
  if (!activeLink) {
    const hrefMap = {
      home: '#Inicio',
      rsvp: '#rsvp',
      photos: '#Fotos',
      questions: '#Dudas'
    };
    const selector = `.li-format[href="${hrefMap[section] || ''}"]`;
    activeLink = document.querySelector(selector);
  }
  if (activeLink) activeLink.classList.add('active');
}

// Guest check logic
let guestsList = [];

// Helper: simple similarity check (case-insensitive, partial match)
function findSimilarGuest(name, guests) {
  name = name.trim().toLowerCase();
  // Try exact match first
  let exact = guests.find(g => g.name.toLowerCase() === name);
  if (exact) return exact;
  // Then partial match
  return guests.find(g => g.name.toLowerCase().includes(name));
}

// Load guests.json
fetch('guests.json')
  .then(response => response.json())
  .then(data => {
    guestsList = data;
    populateConfirmedGuests();
  });

// RSVP form logic (with backend persistence)
document.addEventListener('DOMContentLoaded', function() {
  // Ensure initial visible section is 'home'
  showContent('home');
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const nameInput = document.getElementById('name');
      const name = nameInput.value.trim();
      let messageDiv = document.getElementById('rsvp-message');
      if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'rsvp-message';
        messageDiv.style.marginTop = '1rem';
        messageDiv.style.fontFamily = "Abhaya Libre, serif";
        messageDiv.style.fontSize = '0.95rem';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.letterSpacing = 'normal';
        rsvpForm.appendChild(messageDiv);
      }
      // Check for duplicate first names
      // Find exact and partial matches
      const lowerName = name.toLowerCase();
      const exactMatches = guestsList.filter(g => g.name.toLowerCase() === lowerName);
      const firstName = name.split(' ')[0].toLowerCase();
      const partialMatches = guestsList.filter(g => g.name.toLowerCase().startsWith(firstName));

      if (exactMatches.length === 1) {
        if (exactMatches[0].attending) {
          messageDiv.textContent = `Ya has confirmado tu asistencia, ${exactMatches[0].name}. ¡Nos vemos en la boda!`;
          messageDiv.style.color = '#3b7a57';
          nameInput.value = '';
          return;
        }
        // Only one exact match and not confirmed, allow submission
      } else if (partialMatches.length > 1) {
        messageDiv.textContent = 'Por favor, ingresa tu nombre completo (nombre, primer apellido y segundo apellido) para identificarte correctamente.';
        messageDiv.style.color = '#b22222';
        return;
      }
      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.guest) {
          messageDiv.textContent = `¡Gracias, ${data.guest.name}, por confirmar tu asistencia!`;
          messageDiv.style.color = '#3b7a57';
          // Update guestsList and refresh the confirmed guests list
          const idx = guestsList.findIndex(g => g.name === data.guest.name);
          if (idx !== -1) {
            guestsList[idx].attending = true;
            populateConfirmedGuests();
          }
        } else {
          messageDiv.textContent = 'No pudimos encontrar tu nombre en la lista. Por favor, verifica e intenta de nuevo.';
          messageDiv.style.color = '#b22222';
        }
        nameInput.value = '';
      })
      .catch((error) => {
        console.error('RSVP submission error:', error);
        messageDiv.textContent = 'Ocurrió un error al confirmar. Intenta de nuevo más tarde.';
        messageDiv.style.color = '#b22222';
      });
    });
  }
});

// Initial calls
updateCountdown();

// Populate the ul with confirmed guests
function populateConfirmedGuests() {
  const listEl = document.getElementById('confirmed-guests-list');
  if (!listEl) return;
  const confirmed = guestsList.filter(g => g.attending);
  if (confirmed.length === 0) {
    listEl.innerHTML = '<li>No hay invitados confirmados aún.</li>';
    return;
  }
  listEl.innerHTML = confirmed.map(g => `<li>${g.name}</li>`).join('');
}