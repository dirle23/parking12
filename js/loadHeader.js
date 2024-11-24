// FILE: js/loadHeader.js
// Cargar el contenido del header
fetch('partials/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-container').innerHTML = data;

        // Después de cargar el header, inicializa el menú hamburguesa
        const menuToggle = document.getElementById("menu-toggle");
        const sidebar = document.getElementById("sidebar");

        if (menuToggle && sidebar) {
            menuToggle.addEventListener("click", function () {
                // Toggle para mostrar/ocultar el sidebar
                sidebar.classList.toggle("active");
                sidebar.classList.toggle("translate-x-0"); // Muestra/oculta el sidebar
                sidebar.classList.toggle("-translate-x-full"); // Oculta el sidebar
            });
        }
    });