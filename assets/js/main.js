document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.createElement('button');
  menuToggle.innerHTML = '☰';
  menuToggle.className = 'menu-toggle';
  document.querySelector('nav').prepend(menuToggle);

  menuToggle.addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('show');
  });

  // Handle dropdown clicks
  const dropdowns = document.querySelectorAll('.dropdown > a');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdownContent = this.nextElementSibling;
      dropdownContent.classList.toggle('show');
    });
  });
});