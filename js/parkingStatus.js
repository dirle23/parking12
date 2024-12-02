document.addEventListener('DOMContentLoaded', function() {
    const parkingStatus = document.getElementById('parking-status');
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    let Open = false;

    if (day >= 1 && day <= 5) { // Lunes a viernes
        if ((hour > 6 || (hour === 6 && minute >= 0)) && (hour < 22 || (hour === 22 && minute === 0))) {
            Open = true;
        }
    } else if (day === 6) { // Sábados
        if ((hour > 9 || (hour === 9 && minute >= 0)) && (hour < 19 || (hour === 19 && minute === 0))) {
            Open = true;
        }
    } else if (day === 0) { // Domingos
        if ((hour > 9 || (hour === 9 && minute >= 0)) && (hour < 12 || (hour === 12 && minute === 0))) {
            Open = true;
        }
    }

    if (Open) {
        parkingStatus.textContent = 'El parqueadero está abierto.';
        parkingStatus.classList.add('text-green-500');
    } else {
        parkingStatus.textContent = 'El parqueadero está cerrado. Horarios disponibles: Lunes a viernes: 6:00 a.m. a 10:00 p.m., Sábados: 9:00 a.m. a 7:00 p.m., Domingos: 9:00 a.m. a 12:00 p.m.';
        parkingStatus.classList.add('text-red-500');
    }
});