document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.createElement('button');
  menuToggle.innerHTML = '☰';
  menuToggle.className = 'menu-toggle';
  document.querySelector('nav').prepend(menuToggle);

  menuToggle.addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('show');
  });

  // Handle dropdown clicks on mobile
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.querySelector('.dropdown-content').classList.toggle('show');
      }
    });
  });
});