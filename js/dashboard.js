document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from the server and update the dashboard
    fetch('/php/server_dashboard.php?action=getDashboardData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('horasTotales').innerText = data.horasTotales;
            document.getElementById('multasPermanencia').innerText = data.multasPermanencia;
            document.getElementById('puestosOcupados').innerText = data.puestosOcupados;
            document.getElementById('puestosDisponibles').innerText = data.puestosDisponibles;
            document.getElementById('ingresosEgresos').innerText = data.ingresosEgresos;
            document.getElementById('multasGeneradasPagadas').innerText = data.multasGeneradasPagadas;
            document.getElementById('mensualidadesActivasVencidas').innerText = data.mensualidadesActivasVencidas;
        })
        .catch(error => {
            console.error('Error al obtener los datos del dashboard:', error);
        });
});