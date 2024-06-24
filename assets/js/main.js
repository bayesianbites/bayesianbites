document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.createElement('button');
  menuToggle.innerHTML = '☰';
  menuToggle.className = 'menu-toggle';
  document.querySelector('nav').prepend(menuToggle);

  menuToggle.addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('show');
  });
});