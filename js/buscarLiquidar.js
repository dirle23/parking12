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
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    // Mostrar tiempo de ocupación
    document.getElementById("tiempoOcupacion2").value = `${horas} horas y ${minutos} minutos`;

    // Calcular multa (simulación asincrónica)
    const multa = await cargarMulta();

    // Calcular total
    const total = horas * tarifa + multa;

    // Mostrar total y multa
    document.getElementById("total2").value = `${total.toFixed(2)} COP`;
    document.getElementById("multa2").value = `${multa.toFixed(2)} COP`;
}

// Función para cargar multa
async function cargarMulta() {
    const response = await fetch("./php/liquidar_formulario.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=getMulta`
    });
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
    .then(response => response.json())
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
