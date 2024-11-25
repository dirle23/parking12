document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
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
  let currentIdToDelete = null;

  // Abrir el modal para agregar un nuevo ingreso
  abrirModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
    dataForm.reset();
    document.getElementById("id_ingreso").value = "";
  });

  // Cerrar el modal de agregar/editar ingreso
  cerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Cerrar el modal de ver ingreso
  cerrarModalVer.addEventListener("click", () => {
    modalVer.classList.add("hidden");
  });

  // Cancelar la eliminación de un ingreso
  btnEliminarCancelar.addEventListener("click", () => {
    modalEliminar.classList.add("hidden");
    currentIdToDelete = null;
  });

  // Confirmar la eliminación de un ingreso
  btnEliminarConfirmar.addEventListener("click", () => {
    if (currentIdToDelete) {
      fetch("/php/server_ingresos.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=delete&id_ingreso=${currentIdToDelete}`,
      })
        .then((response) => response.json())
        .then((data) => {
          mostrarMensaje(data.success ? "exito" : "error", data.message);
          if (data.success) fetchIngresos();
          
          modalEliminar.classList.add("hidden");
          currentIdToDelete = null;
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al eliminar ingreso. Inténtalo nuevamente."
          );
          console.error("Error:", error);
          modalEliminar.classList.add("hidden");
          currentIdToDelete = null;
        });
    }
  });

  // Cerrar modales al hacer clic fuera de ellos
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
    if (event.target === modalVer) {
      modalVer.classList.add("hidden");
    }
    if (event.target === modalEliminar) {
      modalEliminar.classList.add("hidden");
    }
  });

  // Enviar datos del formulario de ingreso
  dataForm.addEventListener("submit", enviarDatos);

  function enviarDatos(event) {
    event.preventDefault();

    const formData = new FormData(dataForm);
    const action = formData.get("id_ingreso") ? "update" : "add";
    formData.append("action", action);

    fetch("/php/server_ingresos.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        mostrarMensaje(data.success ? "exito" : "error", data.message);
        if (data.success) {
          modal.classList.add("hidden");
          fetchIngresos();
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  // Obtener y mostrar todos los ingresos
  function fetchIngresos() {
    fetch("/php/server_ingresos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json();
      })
      .then((data) => {
        dataTable.innerHTML = "";
        data.forEach((ingreso) => {
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
            <div class="py-2 px-4"><span class="font-bold">ID: </span>${ingreso.id_ingreso}</div>
            <div class="py-2 px-4"><span class="font-bold">Vehículo: </span>${ingreso.vehiculo}</div>
            <div class="py-2 px-4"><span class="font-bold">Puesto: </span>${ingreso.puesto}</div>
            <div class="py-2 px-4"><span class="font-bold">Fecha Ingreso: </span>${ingreso.fecha_ingreso}</div>
            <div class="py-2 px-4"><span class="font-bold">Fecha Salida: </span>${ingreso.fecha_salida}</div>
            <div class="py-2 px-4"><span class="font-bold">Tarifa Aplicada: </span>${ingreso.tarifa_aplicada}</div>
            <div class="py-2 px-4"><span class="font-bold">Multa: </span>${ingreso.multa}</div>
            <div class="flex justify-center mt-4 space-x-2">
                <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewIngreso(${ingreso.id_ingreso})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editIngreso(${ingreso.id_ingreso})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteIngreso(${ingreso.id_ingreso})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
          `;
          dataTable.appendChild(card);
        });
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar ingresos. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  }

  // Editar un ingreso
  window.editIngreso = function (id) {
    fetch("/php/server_ingresos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_ingreso=${id}`,
    })
      .then((response) => response.json())
      .then((ingreso) => {
        document.getElementById("id_ingreso").value = ingreso.id_ingreso;
        document.getElementById("id_vehiculo").value = ingreso.id_vehiculo;
        document.getElementById("id_puesto").value = ingreso.id_puesto;
        document.getElementById("fecha_ingreso").value = ingreso.fecha_ingreso;
        document.getElementById("fecha_salida").value = ingreso.fecha_salida;
        document.getElementById("tarifa_aplicada").value = ingreso.tarifa_aplicada;
        document.getElementById("multa").value = ingreso.multa;
        modal.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar ingreso. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  // Confirmar eliminación de un ingreso
  window.confirmDeleteIngreso = function (id) {
    currentIdToDelete = id;
    modalEliminar.classList.remove("hidden");
  };

  // Ver detalles de un ingreso
  window.viewIngreso = function (id) {
    fetch("/php/server_ingresos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_ingreso=${id}`,
    })
      .then((response) => response.json())
      .then((ingreso) => {
        document.getElementById("verId").textContent = ingreso.id_ingreso;
        document.getElementById("verVehiculo").textContent = ingreso.vehiculo;
        document.getElementById("verPuesto").textContent = ingreso.puesto;
        document.getElementById("verFechaIngreso").textContent = ingreso.fecha_ingreso;
        document.getElementById("verFechaSalida").textContent = ingreso.fecha_salida;
        document.getElementById("verTarifaAplicada").textContent = ingreso.tarifa_aplicada;
        document.getElementById("verMulta").textContent = ingreso.multa;
        modalVer.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar ingreso. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  // Mostrar mensaje en el modal de mensajes
  function mostrarMensaje(tipo, mensaje) {
    mensajeTexto.textContent = mensaje;
    modalMensaje.classList.remove("hidden");
    setTimeout(() => {
      modalMensaje.classList.add("hidden");
    }, 3000);
  }

  // Cargar ingresos al cargar la página
  fetchIngresos();
});