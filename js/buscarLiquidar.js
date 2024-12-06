// Establece la fecha y hora actual en los campos de salida por defecto
function setFechaHoraActualSalida() {
    const now = new Date();
    const fechaActual = now.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const horaActual = now.toTimeString().split(":").slice(0, 2).join(":"); // Formato militar HH:MM

    document.getElementById("fechaSalida2").value = fechaActual;
    document.getElementById("horaSalida2").value = horaActual;
}

// Función para calcular tiempo de ocupación, total y multa
async function calcularTiempoYTotal() {
    const fechaIngreso = document.getElementById("fechaIngreso2").value;
    const horaIngreso = document.getElementById("horaIngreso2").value;
    const fechaSalida = document.getElementById("fechaSalida2").value;
    const horaSalida = document.getElementById("horaSalida2").value;
    const tarifa = parseFloat(document.getElementById("tarifa2").value);

    if (!fechaIngreso || !horaIngreso || !fechaSalida || !horaSalida || isNaN(tarifa)) {
        alert("Asegúrate de que todos los campos estén llenos y la tarifa sea válida.");
        return;
    }

    const fechaHoraIngreso = new Date(`${fechaIngreso}T${horaIngreso}`);
    const fechaHoraSalida = new Date(`${fechaSalida}T${horaSalida}`);

    if (fechaHoraSalida < fechaHoraIngreso) {
        alert("La fecha y hora de salida no pueden ser anteriores a las de ingreso.");
        return;
    }

    // Diferencia en minutos
    const diferenciaMilisegundos = fechaHoraSalida - fechaHoraIngreso;
    const minutosTotales = Math.floor(diferenciaMilisegundos / (1000 * 60));
    const horasCompletas = Math.floor(minutosTotales / 60);
    const minutosRestantes = minutosTotales % 60;

    // Cálculo considerando los 15 minutos de gracia
    let horasFacturables = horasCompletas;
    if (minutosRestantes > 15) {
        horasFacturables += 1; // Se cobra una hora completa si se exceden los 15 minutos de gracia
    }

    // Mostrar tiempo de ocupación
    document.getElementById("tiempoOcupacion2").value = `${horasCompletas} horas y ${minutosRestantes} minutos`;

    try {
        // Calcular multa (simulación asincrónica)
        const multa = await cargarMulta();

        // Calcular total
        const total = horasFacturables * tarifa + multa;

        // Mostrar total y multa
        document.getElementById("total2").value = `${total.toFixed(2)} COP`;
        document.getElementById("multa2").value = `${multa.toFixed(2)} COP`;
    } catch (error) {
        console.error("Error al cargar la multa:", error);
        alert("Ocurrió un error al calcular la multa. Por favor, intenta nuevamente.");
    }
}

// Función para cargar multa
async function cargarMulta() {
    const response = await fetch("./php/liquidar_formulario.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=getMulta`
    });

    if (!response.ok) {
        throw new Error("Error al obtener la multa.");
    }

    const data = await response.json();
    return data.success ? parseFloat(data.multa || 0) : 0;
}

// Función para buscar vehículo
function buscarVehiculo2() {
    const placa = document.getElementById("buscar-placa2").value;

    if (!placa) {
        alert("Por favor, ingresa una placa.");
        return;
    }

    fetch("./php/liquidar_formulario.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=getVehiculo&placa=${encodeURIComponent(placa)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al buscar el vehículo.");
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const vehiculo = data.vehiculo;

            // Cargar información
            document.getElementById("tipoVehiculo2").value = vehiculo.tipo;
            document.getElementById("placa2").value = placa;
            document.getElementById("propietario2").value = vehiculo.propietario;
            document.getElementById("fechaIngreso2").value = vehiculo.fecha_ingreso.split(' ')[0];
            document.getElementById("horaIngreso2").value = vehiculo.fecha_ingreso.split(' ')[1];
            document.getElementById("puesto2").value = vehiculo.codigo_puesto;
            document.getElementById("tarifa2").value = vehiculo.tarifa;
            document.getElementById("idIngreso").value = vehiculo.id_ingreso;

            // Establecer fecha y hora actual como sugerencia
            setFechaHoraActualSalida();

            // Calcular tiempo y total
            calcularTiempoYTotal();
        } else {
            alert(data.message || "No se encontró el vehículo.");
        }
    })
    .catch(error => {
        console.error("Error al buscar el vehículo:", error);
        alert("Ocurrió un error al buscar el vehículo.");
    });
}

// Función para registrar salida
async function registrarSalida() {
    const idIngreso = document.getElementById('idIngreso').value;
    const fechaSalida = document.getElementById('fechaSalida2').value;
    const horaSalida = document.getElementById('horaSalida2').value;
    const tarifaAplicada = document.getElementById('tarifa2').value;
    const multa = document.getElementById('multa2').value;

    if (!fechaSalida || !horaSalida || !idIngreso) {
        alert("Por favor complete todos los campos necesarios.");
        return;
    }

    // Combinar fecha y hora para enviar al servidor
    const fechaHoraSalida = `${fechaSalida} ${horaSalida}:00`;

    // Realizar la solicitud AJAX al backend
    try {
        const response = await fetch('./php/liquidar_formulario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=registrarSalida&idIngreso=${encodeURIComponent(idIngreso)}&fechaSalida=${encodeURIComponent(fechaHoraSalida)}&tarifaAplicada=${encodeURIComponent(tarifaAplicada)}&multa=${encodeURIComponent(multa)}`
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            location.reload(); // Recargar la página para reflejar los cambios
        } else {
            alert(data.message || 'Error al procesar la solicitud.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error inesperado.');
    }
}

// Función para liquidar vehículo (incorpora la multa por fuera de servicio)
function liquidarVehiculo2() {
    const fechaIngreso = new Date(document.getElementById('fechaIngreso2').value + 'T' + document.getElementById('horaIngreso2').value);
    const fechaSalidaS = new Date(document.getElementById('fechaSalida2').value + 'T' + document.getElementById('horaSalida2').value);

    const horarios = {
        lunes: { inicio: '06:00', fin: '22:00' },
        martes: { inicio: '06:00', fin: '22:00' },
        miercoles: { inicio: '06:00', fin: '22:00' },
        jueves: { inicio: '06:00', fin: '22:00' },
        viernes: { inicio: '06:00', fin: '22:00' },
        sabado: { inicio: '09:00', fin: '19:00' },
        domingo: { inicio: '09:00', fin: '12:00' }
    };

    let horasFueraServicio = 0;

    for (let d = new Date(fechaIngreso); d <= fechaSalidaS; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        const horario = horarios[diaSemana];
        const inicioServicio = new Date(d.toDateString() + 'T' + horario.inicio);
        const finServicio = new Date(d.toDateString() + 'T' + horario.fin);

        if (d < inicioServicio) {
            horasFueraServicio += (inicioServicio - d) / (1000 * 60 * 60);
        }
        if (d > finServicio) {
            horasFueraServicio += (d - finServicio) / (1000 * 60 * 60);
        }
    }

    const tarifaPorHora = 10; // Tarifa por hora fuera de servicio
    const multa = horasFueraServicio * tarifaPorHora;

    document.getElementById('multa2').value = multa.toFixed(2);

    registrarSalida();
}