const horarioApertura = {
    lunesViernes: { apertura: "06:00:00", cierre: "22:00:00" },
    sabado: { apertura: "09:00:00", cierre: "19:00:00" },
    domingo: { apertura: "09:00:00", cierre: "12:00:00" }
};

document.addEventListener('DOMContentLoaded', function() {
    const placaInput = document.getElementById('placa');
    const tipoVehiculoSelect = document.getElementById('tipoVehiculo');
    const propietarioInput = document.getElementById('propietario');
    const fechaIngresoInput = document.getElementById('fechaIngreso');
    const horaIngresoInput = document.getElementById('horaIngreso');
    const puestoInput = document.getElementById('puesto');
    const tarifaInput = document.getElementById('tarifa');
    const fechaSalidaInput = document.getElementById('fechaSalida');
    const horaSalidaInput = document.getElementById('horaSalida');
    const totalInput = document.getElementById('total');

    // Autocompletar fecha y hora de ingreso con la fecha/hora actual
    const now = new Date();
    fechaIngresoInput.value = now.toISOString().split('T')[0];
    horaIngresoInput.value = now.toTimeString().split(' ')[0].substring(0, 5);

    // Función para asignar automáticamente un puesto disponible
    function asignarPuesto() {
        fetch('/php/server_formulario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getPuestos'
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    puestoInput.value = data[0].codigo;
                } else {
                    alert('No hay puestos disponibles.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Asignar puesto automáticamente al cargar la página
    asignarPuesto();

    // Función para obtener la tarifa basada en el tipo de vehículo
    function obtenerTarifa() {
        const tipoVehiculo = tipoVehiculoSelect.value;
        if (tipoVehiculo) {
            fetch('/php/server_formulario.php', {
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
                        alert('Error al obtener la tarifa.');
                    }
                })
                .catch(error => {
                    tarifaInput.value = '';
                    console.error('Error:', error);
                });
        } else {
            tarifaInput.value = '';
        }
    }

    // Obtener la tarifa cuando se selecciona un tipo de vehículo
    tipoVehiculoSelect.addEventListener('change', obtenerTarifa);

    function ingresarVehiculo() {
        const placa = placaInput.value;
        const tipoVehiculo = tipoVehiculoSelect.value;
        const propietario = propietarioInput.value;
        const fechaIngreso = `${fechaIngresoInput.value} ${horaIngresoInput.value}`;
        const puesto = puestoInput.value;
        const tarifa = tarifaInput.value;

        if (!placa || !tipoVehiculo || !propietario || !fechaIngreso || !puesto || !tarifa) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const formData = new URLSearchParams();
        formData.append('action', 'add');
        formData.append('placa', placa);
        formData.append('tipoVehiculo', tipoVehiculo);
        formData.append('propietario', propietario);
        formData.append('fecha_ingreso', fechaIngreso);
        formData.append('id_puesto', puesto);
        formData.append('tarifa', tarifa);

        fetch('/php/server_formulario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Vehículo registrado con éxito.');
                    limpiarFormulario();
                    asignarPuesto();
                } else {
                    alert('Error al registrar el vehículo.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function calcularTotal() {
        const tarifaHora = parseFloat(tarifaInput.value);
        const fechaIngreso = new Date(`${fechaIngresoInput.value}T${horaIngresoInput.value}`);
        const fechaSalida = new Date(`${fechaSalidaInput.value}T${horaSalidaInput.value}`);
        const horasEstacionadas = Math.ceil((fechaSalida - fechaIngreso) / (1000 * 60 * 60));
        let total = tarifaHora * horasEstacionadas;

        // Verificar si hay multas
        fetch(`/php/server_multa.php?action=obtenerMultas&placa=${placaInput.value}`)
            .then(response => response.json())
            .then(data => {
                if (data.multas && data.multas.length > 0) {
                    data.multas.forEach(multa => {
                        total += multa.monto;
                    });
                }
                totalInput.value = total.toFixed(2);
            })
            .catch(error => {
                console.error('Error al obtener las multas:', error);
            });
    }

    function autocompletarFormulario() {
        const placa = placaInput.value;
        if (!placa) {
            alert('Por favor, ingresa la placa del vehículo.');
            return;
        }

        fetch('/php/server_ingreso.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getIngresoByPlaca&placa=${placa}`
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const ingreso = data.data;
                    tipoVehiculoSelect.value = ingreso.tipo;
                    propietarioInput.value = ingreso.propietario;
                    fechaIngresoInput.value = ingreso.fecha_ingreso.split(' ')[0];
                    horaIngresoInput.value = ingreso.fecha_ingreso.split(' ')[1].substring(0, 5);
                    puestoInput.value = ingreso.puesto_codigo;
                    tarifaInput.value = ingreso.tarifa_aplicada;
                    fechaSalidaInput.value = ingreso.fecha_salida ? ingreso.fecha_salida.split(' ')[0] : '';
                    horaSalidaInput.value = ingreso.fecha_salida ? ingreso.fecha_salida.split(' ')[1].substring(0, 5) : '';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos del ingreso:', error);
            });
    }

    document.getElementById('ingresarVehiculo').addEventListener('click', ingresarVehiculo);
    document.getElementById('Liquidar').addEventListener('click', calcularTotal);
    placaInput.addEventListener('blur', autocompletarFormulario);
});

function limpiarFormulario() {
    document.getElementById('placa').value = '';
    document.getElementById('tipoVehiculo').value = 'automovil';
    document.getElementById('propietario').value = '';
    document.getElementById('fechaIngreso').value = '';
    document.getElementById('horaIngreso').value = '';
    document.getElementById('puesto').value = '';
    document.getElementById('tarifa').value = '';
    document.getElementById('fechaSalida').value = '';
    document.getElementById('horaSalida').value = '';
    document.getElementById('total').value = '';
}

function verificarHorarioSalida(fechaSalida, horaSalida) {
    const diaSemana = new Date(fechaSalida).getDay();
    let apertura, cierre;

    if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
        apertura = horarioApertura.lunesViernes.apertura;
        cierre = horarioApertura.lunesViernes.cierre;
    } else if (diaSemana === 6) { // Sábado
        apertura = horarioApertura.sabado.apertura;
        cierre = horarioApertura.sabado.cierre;
    } else if (diaSemana === 0) { // Domingo
        apertura = horarioApertura.domingo.apertura;
        cierre = horarioApertura.domingo.cierre;
    }

    const horaSalidaCompleta = `${fechaSalida} ${horaSalida}`;
    const horaSalidaDate = new Date(horaSalidaCompleta);
    const horaAperturaDate = new Date(`${fechaSalida} ${apertura}`);
    const horaCierreDate = new Date(`${fechaSalida} ${cierre}`);

    return horaSalidaDate < horaAperturaDate || horaSalidaDate > horaCierreDate;
}

function verificarHorarioMensualidad(idVehiculo, fechaSalida, horaSalida) {
    fetch(`/php/server_multa.php?action=obtenerHorarioMensualidad&idVehiculo=${idVehiculo}`)
        .then(response => response.json())
        .then(data => {
            const horarioEntrada = data.horario_entrada;
            const horarioSalida = data.horario_salida;

            const horaSalidaCompleta = `${fechaSalida} ${horaSalida}`;
            const horaSalidaDate = new Date(horaSalidaCompleta);
            const horaEntradaDate = new Date(`${fechaSalida} ${horarioEntrada}`);
            const horaSalidaPermitidaDate = new Date(`${fechaSalida} ${horarioSalida}`);

            if (horaSalidaDate < horaEntradaDate || horaSalidaDate > horaSalidaPermitidaDate) {
                generarMulta(idVehiculo, fechaSalida, horaSalida);
            } else {
                registrarSalidaSinMulta(idVehiculo, fechaSalida, horaSalida);
            }
        })
        .catch(error => {
            console.error('Error al obtener el horario de mensualidad:', error);
        });
}

function generarMulta(idVehiculo, fechaSalida, horaSalida) {
    const montoMulta = 10000; // Define el monto de la multa
    const fechaGenerada = new Date().toISOString().slice(0, 19).replace('T', ' ');

    fetch('/php/server_multa.php?action=add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idVehiculo: idVehiculo,
            monto: montoMulta,
            fechaGenerada: fechaGenerada,
            pagada: false
        })
    }).then(response => response.json())
      .then(data => {
          console.log('Multa generada:', data);
          mostrarMensaje('Multa generada exitosamente.');
      })
      .catch(error => {
          console.error('Error al generar la multa:', error);
          mostrarMensaje('Error al generar la multa.');
      });
}

function registrarSalida() {
    const idVehiculo = document.getElementById('placa').value;
    const fechaSalida = new Date().toISOString().slice(0, 10); // Fecha actual
    const horaSalida = new Date().toISOString().slice(11, 19); // Hora actual

    fetch(`/php/server_multa.php?action=verificarMensualidad&idVehiculo=${idVehiculo}`)
        .then(response => response.json())
        .then(data => {
            if (data.tieneMensualidad) {
                verificarHorarioMensualidad(idVehiculo, fechaSalida, horaSalida);
            } else {
                if (verificarHorarioSalida(fechaSalida, horaSalida)) {
                    generarMulta(idVehiculo, fechaSalida, horaSalida);
                } else {
                    registrarSalidaSinMulta(idVehiculo, fechaSalida, horaSalida);
                }
            }
        })
        .catch(error => {
            console.error('Error al verificar la mensualidad:', error);
        });
}

function registrarSalidaSinMulta(idVehiculo, fechaSalida, horaSalida) {
    console.log(`Registrar salida del vehículo ${idVehiculo} sin multa.`);
}

function mostrarMensaje(mensaje) {
    const modalMensaje = document.getElementById('modalMensaje');
    document.getElementById('mensajeTexto').innerText = mensaje;
    modalMensaje.classList.remove('hidden');
    setTimeout(() => {
        modalMensaje.classList.add('hidden');
    }, 3000);
}