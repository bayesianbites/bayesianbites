document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  menuToggle.addEventListener('click', function() {
    siteNav.classList.toggle('active');
  });

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentElement.classList.toggle('active');
    });
  });
});