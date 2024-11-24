document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const abrirModal = document.getElementById("openModal");
  const cerrarModal = document.getElementById("closeModal");
  const btnEliminarConfirmar = document.getElementById("btnEliminarConfirmar");
  const btnEliminarCancelar = document.getElementById("btnEliminarCancelar");
  const dataForm = document.getElementById("dataForm");
  const dataTable = document.getElementById("dataTable");
  const modalMensaje = document.getElementById("modalMensaje");
  const mensajeTexto = document.getElementById("mensajeTexto");
  let currentIdToDelete = null;

  // Abrir el modal para agregar un registro
  abrirModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
    dataForm.reset();
    document.getElementById("id_ingreso").value = "";
    cargarSelectores();  // Llamar a cargar selectores aquí
  });

  // Cerrar el modal de agregar
  cerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Cancelar la eliminación de un registro
  btnEliminarCancelar.addEventListener("click", () => {
    modalEliminar.classList.add("hidden");
    currentIdToDelete = null;
  });

  // Confirmar la eliminación de un registro
  btnEliminarConfirmar.addEventListener("click", () => {
    if (currentIdToDelete) {
      fetch("php/server_ingresos.php", {
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

    fetch("php/server_ingresos.php", {
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
    fetch("php/server_ingresos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => response.json())
      .then((data) => {
        dataTable.innerHTML = "";
        data.forEach((registro) => {
          const row = document.createElement("div");
          row.classList.add(
            "block",
            "bg-white",
            "md:table-row",
            "mb-4",
            "md:mb-0",
            "border",
            "border-gray-200",
            "rounded-lg",
            "shadow-sm",
            "p-4",
            "md:p-0"
          );
          row.innerHTML = `
            <div class="py-2 px-4 block md:table-cell">${registro.id_ingreso}</div>
            <div class="py-2 px-4 block md:table-cell">${registro.id_vehiculo}</div>
            <div class="py-2 px-4 block md:table-cell">${registro.id_puesto}</div>
            <div class="py-2 px-4 block md:table-cell">${registro.fecha_ingreso}</div>
            <div class="py-2 px-4 block md:table-cell">${registro.fecha_salida || "N/A"}</div>
            <div class="py-2 px-4 block md:table-cell">${formatearPrecio(registro.tarifa_aplicada)}</div>
            <div class="py-2 px-4 block md:table-cell">${formatearPrecio(registro.multa)}</div>
            <div class="py-2 px-4 block md:table-cell">
                <button class="bg-green-500 text-white px-2 py-1 rounded-md" onclick="viewRegistro(${registro.id_ingreso})">Ver</button>
                <button class="bg-yellow-500 text-white px-2 py-1 rounded-md" onclick="editRegistro(${registro.id_ingreso})">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded-md" onclick="confirmDeleteRegistro(${registro.id_ingreso})">Eliminar</button>
            </div>
          `;
          dataTable.appendChild(row);
        });
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al cargar los registros. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  // Función para formatear el precio
  function formatearPrecio(precio) {
    return precio.toLocaleString("es-ES", { minimumFractionDigits: 2 });
  }

  // Función para cargar los selectores de vehículos y puestos
  function cargarSelectores() {
    return Promise.all([
      // Cargar vehículos
      fetch("php/server_vehiculo.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=fetch",
      })
        .then((response) => response.json())
        .then((data) => {
          const vehiculoSelect = document.getElementById("id_vehiculo");
          vehiculoSelect.innerHTML = '<option value="">Selecciona un vehículo</option>';
          data.forEach((vehiculo) => {
            const option = document.createElement("option");
            option.value = vehiculo.id_vehiculo;
            option.textContent = vehiculo.placa;
            vehiculoSelect.appendChild(option);
          });
        })
        .catch((error) => {
          mostrarMensaje("error", "Error al cargar vehículos. Inténtalo nuevamente.");
          console.error("Error:", error);
        }),

      // Cargar puestos
      fetch("php/server_puesto.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=fetch",
      })
        .then((response) => response.json())
        .then((data) => {
          const puestoSelect = document.getElementById("id_puesto");
          puestoSelect.innerHTML = '<option value="">Selecciona un puesto</option>';
          data.forEach((puesto) => {
            const option = document.createElement("option");
            option.value = puesto.id_puesto;
            option.textContent = puesto.codigo;
            puestoSelect.appendChild(option);
          });
        })
        .catch((error) => {
          mostrarMensaje("error", "Error al cargar puestos. Inténtalo nuevamente.");
          console.error("Error:", error);
        })
    ]);
  }

  // Mostrar mensaje en el modal de mensajes
  function mostrarMensaje(tipo, mensaje) {
    mensajeTexto.textContent = mensaje;
    modalMensaje.classList.remove("hidden");
    setTimeout(() => {
      modalMensaje.classList.add("hidden");
    }, 3000);
  }

  // Cargar registros y selectores al cargar la página
  fetchRegistros();
  cargarSelectores();
});