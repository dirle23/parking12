document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modal");
    const modalVer = document.getElementById("modalVer");
    const modalEliminar = document.getElementById("modalEliminar");
    const abrirModal = document.getElementById("openModal");
    const cerrarModal = document.getElementById("closeModal");
    const cerrarModalVer = document.getElementById("closeModalVer");
    const btnEliminarConfirmar = document.getElementById("btnEliminarConfirmar");
    const btnEliminarCancelar = document.getElementById("btnEliminarCancelar");
    const dataForm = document.getElementById("dataForm");
    const dataTable = document.getElementById("dataTable");
    const modalMensaje = document.getElementById("modalMensaje");
    const mensajeTexto = document.getElementById("mensajeTexto");
    const idVehiculoSelect = document.getElementById("id_vehiculo");
    const tarifaAplicadaInput = document.getElementById("tarifa_aplicada");
    let currentIdToDelete = null;

    // Abrir el modal para agregar un registro
    abrirModal.addEventListener("click", () => {
        modal.classList.remove("hidden");
        dataForm.reset();
        document.getElementById("id_ingreso").value = "";
        cargarVehiculos();
        cargarPuestos();
    });

    // Cerrar el modal de agregar
    cerrarModal.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Cerrar el modal de ver
    cerrarModalVer.addEventListener("click", () => {
        modalVer.classList.add("hidden");
    });

    // Cancelar la eliminación de un registro
    btnEliminarCancelar.addEventListener("click", () => {
        modalEliminar.classList.add("hidden");
        currentIdToDelete = null;
    });

    // Confirmar la eliminación de un registro
    btnEliminarConfirmar.addEventListener("click", () => {
        if (currentIdToDelete) {
            fetch("/php/server_ingreso.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=delete&id_ingreso=${currentIdToDelete}`,
            })
                .then((response) => response.json())
                .then((data) => {
                    mostrarMensaje(data.success ? "exito" : "error", data.message);
                    if (data.success) {
                        fetchRegistros();
                    }
                    modalEliminar.classList.add("hidden");
                    currentIdToDelete = null;
                })
                .catch((error) => {
                    mostrarMensaje("error", "Error al eliminar el registro. Inténtalo nuevamente.");
                    console.error("Error:", error);
                    modalEliminar.classList.add("hidden");
                    currentIdToDelete = null;
                });
        }
    });

    // Enviar el formulario
    dataForm.addEventListener("submit", enviarDatos);

    function enviarDatos(event) {
        event.preventDefault();

        const formData = new FormData(dataForm);
        const action = formData.get("id_ingreso") ? "update" : "add";
        formData.append("action", action);

        fetch("/php/server_ingreso.php", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                mostrarMensaje(data.success ? "exito" : "error", data.message);
                if (data.success) {
                    modal.classList.add("hidden");
                    fetchRegistros();
                }
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    }

    // Función para obtener y mostrar los registros
    function fetchRegistros() {
        fetch("/php/server_ingreso.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=fetch",
        })
            .then((response) => response.json())
            .then((data) => {
                dataTable.innerHTML = "";
                data.forEach((registro) => {
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
                        <div class="py-2 px-4"><span class="font-bold">ID: </span>${registro.id_ingreso}</div>
                        <div class="py-2 px-4"><span class="font-bold">ID Vehículo: </span>${registro.id_vehiculo}</div>
                        <div class="py-2 px-4"><span class="font-bold">ID Puesto: </span>${registro.id_puesto}</div>
                        <div class="py-2 px-4"><span class="font-bold">Fecha Ingreso: </span>${registro.fecha_ingreso}</div>
                        <div class="py-2 px-4"><span class="font-bold">Fecha Salida: </span>${registro.fecha_salida}</div>
                        <div class="py-2 px-4"><span class="font-bold">Tarifa Aplicada: </span>${registro.tarifa_aplicada}</div>
                        <div class="py-2 px-4"><span class="font-bold">Multa: </span>${registro.multa}</div>
                        <div class="flex justify-center mt-4 space-x-2">
                            <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewRegistro(${registro.id_ingreso})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editRegistro(${registro.id_ingreso})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteRegistro(${registro.id_ingreso})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    dataTable.appendChild(card);
                });
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al cargar los registros. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    }

    // Función para mostrar mensajes
    function mostrarMensaje(tipo, mensaje) {
        mensajeTexto.textContent = mensaje;
        modalMensaje.classList.remove("hidden");
        setTimeout(() => {
            modalMensaje.classList.add("hidden");
        }, 3000);
    }

    // Función para cargar vehículos en el select
    function cargarVehiculos() {
        fetch("/php/server_ingreso.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=getVehiculos",
        })
            .then((response) => response.json())
            .then((data) => {
                idVehiculoSelect.innerHTML = "";
                data.forEach((vehiculo) => {
                    const option = document.createElement("option");
                    option.value = vehiculo.id_vehiculo;
                    option.textContent = `${vehiculo.placa} (${vehiculo.tipo})`;
                    idVehiculoSelect.appendChild(option);
                });
                idVehiculoSelect.addEventListener("change", actualizarTarifa);
                actualizarTarifa(); // Actualizar tarifa al cargar los vehículos
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al cargar los vehículos. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    }

    // Función para cargar puestos en el select
    function cargarPuestos() {
        fetch("/php/server_ingreso.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=getPuestos",
        })
            .then((response) => response.json())
            .then((data) => {
                const idPuestoSelect = document.getElementById("id_puesto");
                idPuestoSelect.innerHTML = "";
                data.forEach((puesto) => {
                    const option = document.createElement("option");
                    option.value = puesto.id_puesto;
                    option.textContent = `${puesto.codigo} (${puesto.estado})`;
                    idPuestoSelect.appendChild(option);
                });
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al cargar los puestos. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    }

    // Función para actualizar la tarifa aplicada según el tipo de vehículo
    function actualizarTarifa() {
        const idVehiculo = idVehiculoSelect.value;
        if (idVehiculo) {
            fetch("/php/server_ingreso.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=getTarifa&id_vehiculo=${idVehiculo}`,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        tarifaAplicadaInput.value = data.tarifa_hora;
                    } else {
                        tarifaAplicadaInput.value = "";
                        mostrarMensaje("error", "Error al obtener la tarifa. Inténtalo nuevamente.");
                    }
                })
                .catch((error) => {
                    tarifaAplicadaInput.value = "";
                    mostrarMensaje("error", "Error al obtener la tarifa. Inténtalo nuevamente.");
                    console.error("Error:", error);
                });
        } else {
            tarifaAplicadaInput.value = "";
        }
    }

    // Función para ver un registro
    window.viewRegistro = function (id_ingreso) {
        fetch("/php/server_ingreso.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=fetch&id_ingreso=${id_ingreso}`,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    document.getElementById("verId").textContent = data.id_ingreso;
                    document.getElementById("verIdVehiculo").textContent = data.id_vehiculo;
                    document.getElementById("verIdPuesto").textContent = data.id_puesto;
                    document.getElementById("verFechaIngreso").textContent = data.fecha_ingreso;
                    document.getElementById("verFechaSalida").textContent = data.fecha_salida;
                    document.getElementById("verTarifaAplicada").textContent = data.tarifa_aplicada;
                    document.getElementById("verMulta").textContent = data.multa;
                    modalVer.classList.remove("hidden");
                } else {
                    mostrarMensaje("error", "Error al cargar los detalles. Inténtalo nuevamente.");
                }
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al cargar los detalles. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    };

    // Función para editar un registro
    window.editRegistro = function (id_ingreso) {
        fetch("/php/server_ingreso.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=fetch&id_ingreso=${id_ingreso}`,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    document.getElementById("id_ingreso").value = data.id_ingreso;
                    document.getElementById("id_vehiculo").value = data.id_vehiculo;
                    document.getElementById("id_puesto").value = data.id_puesto;
                    document.getElementById("fecha_ingreso").value = data.fecha_ingreso;
                    document.getElementById("fecha_salida").value = data.fecha_salida;
                    document.getElementById("tarifa_aplicada").value = data.tarifa_aplicada;
                    document.getElementById("multa").value = data.multa;
                    modal.classList.remove("hidden");
                } else {
                    mostrarMensaje("error", "Error al cargar los detalles. Inténtalo nuevamente.");
                }
            })
            .catch((error) => {
                mostrarMensaje("error", "Error al cargar los detalles. Inténtalo nuevamente.");
                console.error("Error:", error);
            });
    };

    // Función para confirmar la eliminación de un registro
    window.confirmDeleteRegistro = function (id_ingreso) {
        currentIdToDelete = id_ingreso;
        modalEliminar.classList.remove("hidden");
    };

    // Cargar los registros al cargar la página
    fetchRegistros();
});