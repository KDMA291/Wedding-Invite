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