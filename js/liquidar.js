document.addEventListener('DOMContentLoaded', function () {
    const tipoVehiculoSelect = document.getElementById('tipoVehiculo');
    const puestoSelect = document.getElementById('puesto');
    const tarifaInput = document.getElementById('tarifa');
    const registrarButton = document.getElementById('registrarVehiculo');
    const fechaIngresoInput = document.getElementById('fechaIngreso');
    const horaIngresoInput = document.getElementById('horaIngreso');
    const esMensualidadSelect = document.getElementById('esMensualidad');
    const camposMensualidadDiv = document.getElementById('camposMensualidad');
    const campoPropietarioDiv = document.getElementById('campoPropietario');
    const propietarioInput = document.getElementById('propietario');

    // Function to set the current date and time in Colombia
    function establecerFechaHoraActual() {
        const ahora = new Date();
        const opcionesFecha = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' };
        const opcionesHora = { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false };

        const fecha = new Intl.DateTimeFormat('es-CO', opcionesFecha).format(ahora).split('/');
        const hora = new Intl.DateTimeFormat('es-CO', opcionesHora).format(ahora).split(':');

        fechaIngresoInput.value = `${fecha[2]}-${fecha[1]}-${fecha[0]}`;
        horaIngresoInput.value = `${hora[0]}:${hora[1]}`;
    }

    establecerFechaHoraActual();

    function cargarPuestosDisponibles() {
        fetch('./php/server_formulario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getPuestos'
        })
        .then(response => response.json())
        .then(data => {
            puestoSelect.innerHTML = '<option value="">Selecciona un puesto</option>';
            data.forEach(puesto => {
                const option = document.createElement('option');
                option.value = puesto.id_puesto;
                option.textContent = puesto.codigo;
                puestoSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar puestos disponibles:', error));
    }

    function validarHorario(fecha, hora) {
        const diaSemana = fecha.getDay();
        const horaActual = parseInt(hora.split(':')[0], 10);
        const minutoActual = parseInt(hora.split(':')[1], 10);

        if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
            return (horaActual >= 6 && (horaActual < 22 || (horaActual === 22 && minutoActual === 0)));
        } else if (diaSemana === 6) { // Sábados
            return (horaActual >= 9 && (horaActual < 19 || (horaActual === 19 && minutoActual === 0)));
        } else if (diaSemana === 0) { // Domingos
            return (horaActual >= 9 && (horaActual < 12 || (horaActual === 12 && minutoActual === 0)));
        }
        return false;
    }

    function limpiarFormulario() {
        tipoVehiculoSelect.value = '';
        document.getElementById('placa').value = '';
        fechaIngresoInput.value = '';
        horaIngresoInput.value = '';
        puestoSelect.value = '';
        tarifaInput.value = '';
        esMensualidadSelect.value = 'no';
        camposMensualidadDiv.classList.add('hidden');
        campoPropietarioDiv.classList.add('hidden');
        propietarioInput.value = 'Invitado';
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        document.getElementById('horarioEntrada').value = '';
        document.getElementById('horarioSalida').value = '';
    }

    tipoVehiculoSelect.addEventListener('change', function () {
        const tipoVehiculo = tipoVehiculoSelect.value;
        if (tipoVehiculo) {
            fetch('./php/server_formulario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=getTarifa&tipoVehiculo=${tipoVehiculo}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    tarifaInput.value = data.tarifa_hora;
                } else {
                    tarifaInput.value = '';
                    alert('Tarifa no encontrada para el tipo de vehículo seleccionado.');
                }
            })
            .catch(error => console.error('Error al cargar tarifa:', error));
        } else {
            tarifaInput.value = '';
        }
    });

    esMensualidadSelect.addEventListener('change', function () {
        if (esMensualidadSelect.value === 'si') {
            camposMensualidadDiv.classList.remove('hidden');
            campoPropietarioDiv.classList.remove('hidden');
        } else {
            camposMensualidadDiv.classList.add('hidden');
            campoPropietarioDiv.classList.add('hidden');
            propietarioInput.value = 'Invitado';
        }
    });

    registrarButton.addEventListener('click', function () {
        const datosVehiculo = {
            tipoVehiculo: tipoVehiculoSelect.value,
            placa: document.getElementById('placa').value,
            fechaIngreso: document.getElementById('fechaIngreso').value,
            horaIngreso: document.getElementById('horaIngreso').value,
            puesto: puestoSelect.value,
            tarifa: tarifaInput.value,
            esMensualidad: esMensualidadSelect.value,
            propietario: propietarioInput.value
        };

        if (datosVehiculo.esMensualidad === 'si') {
            datosVehiculo.fechaInicio = document.getElementById('fechaInicio').value;
            datosVehiculo.fechaFin = document.getElementById('fechaFin').value;
            datosVehiculo.horarioEntrada = document.getElementById('horarioEntrada').value;
            datosVehiculo.horarioSalida = document.getElementById('horarioSalida').value;
        }

        if (!datosVehiculo.tipoVehiculo || !datosVehiculo.placa || !datosVehiculo.fechaIngreso ||
            !datosVehiculo.horaIngreso || !datosVehiculo.puesto) {
            alert('Por favor completa todos los campos antes de registrar.');
            return;
        }

        const fechaIngreso = new Date(datosVehiculo.fechaIngreso);
        const horaIngreso = datosVehiculo.horaIngreso;

        if (!validarHorario(fechaIngreso, horaIngreso)) {
            alert('El horario de ingreso no está dentro del horario permitido del parqueadero.');
            return;
        }

        fetch('./php/server_formulario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=add&${new URLSearchParams(datosVehiculo).toString()}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Vehículo registrado con éxito.');
                limpiarFormulario();
                cargarPuestosDisponibles();
            } else {
                alert(`Error al registrar el vehículo: ${data.message}`);
            }
        })
        .catch(error => console.error('Error al registrar vehículo:', error));
    });

    cargarPuestosDisponibles();
});