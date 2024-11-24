document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const modal = document.getElementById('modal');
    const modalVer = document.getElementById('modalVer');
    const modalEliminar = document.getElementById('modalEliminar');
    const abrirModal = document.getElementById('openModal');
    const cerrarModal = document.getElementById('closeModal');
    const cerrarModalVer = document.getElementById('closeModalVer');
    const btnEliminarConfirmar = document.getElementById('btnEliminarConfirmar');
    const btnEliminarCancelar = document.getElementById('btnEliminarCancelar');
    const dataForm = document.getElementById('dataForm');
    const dataTable = document.getElementById('dataTable');
    const modalMensaje = document.getElementById('modalMensaje');
    const mensajeTexto = document.getElementById('mensajeTexto');
    const tipoVehiculoSelect = document.getElementById('tipo_vehiculo');
    let currentIdToDelete = null;

    // Abrir modal para agregar nueva tarifa
    abrirModal.addEventListener('click', () => {
        modal.classList.remove('hidden');
        dataForm.reset();
        document.getElementById('id_tarifa').value = '';
        fetchVehicleTypes(); // Llenar el select de tipos de vehículos al abrir el modal
    });

    // Cerrar modal
    cerrarModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Cerrar modal de ver tarifa
    cerrarModalVer.addEventListener('click', () => {
        modalVer.classList.add('hidden');
    });

    // Cancelar eliminación de tarifa
    btnEliminarCancelar.addEventListener('click', () => {
        modalEliminar.classList.add('hidden');
        currentIdToDelete = null;
    });

    // Confirmar eliminación de tarifa
    btnEliminarConfirmar.addEventListener('click', () => {
        if (currentIdToDelete) {
            fetch('/php/server_tarifa.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=delete&id_tarifa=${currentIdToDelete}`
            })
            .then(response => response.json())
            .then(data => {
                mostrarMensaje(data.success ? 'exito' : 'error', data.message);
                if (data.success) {
                    fetchTarifas();
                }
                modalEliminar.classList.add('hidden');
                currentIdToDelete = null;
            })
            .catch(error => {
                mostrarMensaje('error', 'Error al eliminar tarifa. Inténtalo nuevamente.');
                console.error('Error:', error);
                modalEliminar.classList.add('hidden');
                currentIdToDelete = null;
            });
        }
    });

    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
        if (event.target === modalVer) {
            modalVer.classList.add('hidden');
        }
        if (event.target === modalEliminar) {
            modalEliminar.classList.add('hidden');
        }
    });

    // Enviar datos del formulario
    dataForm.addEventListener('submit', enviarDatos);

    function enviarDatos(event) {
        event.preventDefault();

        const formData = new FormData(dataForm);
        const action = formData.get('id_tarifa') ? 'update' : 'add';
        formData.append('action', action);

        fetch('/php/server_tarifa.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.success ? 'exito' : 'error', data.message);
            if (data.success) {
                modal.classList.add('hidden');
                fetchTarifas();
            }
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al enviar datos. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    // Obtener y mostrar todas las tarifas
    function fetchTarifas() {
        fetch('/php/server_tarifa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch'
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then((data) => {
            dataTable.innerHTML = "";
            data.forEach((tarifa) => {
              const card = document.createElement("div");
              card.classList.add(
                "bg-white",
                "border",
                "border-gray-200",
                "rounded-lg",
                "shadow-sm",
                "p-4"
              );
              card.innerHTML = `
                <div class="py-2 px-4"><span class="font-bold">ID: </span>${tarifa.id_tarifa}</div>
                <div class="py-2 px-4"><span class="font-bold">Tipo de Vehículo: </span>${tarifa.tipo_vehiculo}</div>
                <div class="py-2 px-4"><span class="font-bold">Tarifa por Hora: </span>${tarifa.tarifa_hora}</div>
                <div class="py-2 px-4"><span class="font-bold">Tiempo de Gracia: </span>${tarifa.tiempo_gracia} minutos</div>
                <div class="flex justify-center mt-4 space-x-2">
                    <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewTarifa(${tarifa.id_tarifa})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editTarifa(${tarifa.id_tarifa})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteTarifa(${tarifa.id_tarifa})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
              `;
              dataTable.appendChild(card);
            });
          })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar tarifas. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    // Obtener y llenar el select de tipos de vehículos
    function fetchVehicleTypes() {
        fetch('/php/server_tarifa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch_vehicle_types'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(types => {
            tipoVehiculoSelect.innerHTML = '';
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                tipoVehiculoSelect.appendChild(option);
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar tipos de vehículos. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    // Editar tarifa
    window.editTarifa = function (id) {
        fetch('/php/server_tarifa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=fetch&id_tarifa=${id}`
        })
        .then(response => response.json())
        .then(tarifa => {
            document.getElementById('id_tarifa').value = tarifa.id_tarifa;
            document.getElementById('tipo_vehiculo').value = tarifa.tipo_vehiculo;
            document.getElementById('tarifa_hora').value = tarifa.tarifa_hora;
            document.getElementById('tiempo_gracia').value = tarifa.tiempo_gracia;
            modal.classList.remove('hidden');
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar tarifa. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    };

    // Confirmar eliminación de tarifa
    window.confirmDeleteTarifa = function (id) {
        currentIdToDelete = id;
        modalEliminar.classList.remove('hidden');
    };

    // Ver detalles de la tarifa
    window.viewTarifa = function (id) {
        fetch('/php/server_tarifa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=fetch&id_tarifa=${id}`
        })
        .then(response => response.json())
        .then(tarifa => {
            document.getElementById('verId').textContent = tarifa.id_tarifa;
            document.getElementById('verTipoVehiculo').textContent = tarifa.tipo_vehiculo;
            document.getElementById('verTarifaHora').textContent = tarifa.tarifa_hora;
            document.getElementById('verTiempoGracia').textContent = tarifa.tiempo_gracia;
            modalVer.classList.remove('hidden');
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar tarifa. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    };

    // Mostrar mensaje en el modal de mensajes
    function mostrarMensaje(tipo, mensaje) {
        mensajeTexto.textContent = mensaje;
        modalMensaje.classList.remove('hidden');
        setTimeout(() => {
            modalMensaje.classList.add('hidden');
        }, 3000);
    }

    // Cargar tarifas y tipos de vehículos al cargar la página
    fetchTarifas();
    fetchVehicleTypes();
});