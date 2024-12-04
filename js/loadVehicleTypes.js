document.addEventListener('DOMContentLoaded', function() {
    fetchVehicleTypes();
});

function fetchVehicleTypes() {
    fetch('/php/server_vehiculo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'action': 'fetch_types'
        })
    })
    .then(response => response.json())
    .then(data => {
        const tipoVehiculoSelect = document.getElementById('tipoVehiculo');
        tipoVehiculoSelect.innerHTML = ''; // Limpiar opciones existentes

        // Agregar la opción "Seleccionar vehículo"
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccionar vehículo';
        tipoVehiculoSelect.appendChild(defaultOption);

        // Agregar las opciones dinámicas
        data.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            tipoVehiculoSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching vehicle types:', error));
}