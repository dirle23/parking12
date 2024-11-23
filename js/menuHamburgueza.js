// Ruta: js/menuHamburgueza.js

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            // Toggle para mostrar/ocultar el sidebar
            sidebar.classList.toggle("active");
            sidebar.classList.toggle("translate-x-0"); // Muestra/oculta el sidebar
        });
    }
});