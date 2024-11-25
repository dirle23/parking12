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

  // Verificar que los elementos existen antes de agregar event listeners
  if (abrirModal) {
    abrirModal.addEventListener("click", () => {
      modal.classList.remove("hidden");
      dataForm.reset();
      const idMensualidad = document.getElementById("id_mensualidad");
      if (idMensualidad) {
        idMensualidad.value = "";
      }
    });
  }

  if (cerrarModal) {
    cerrarModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (cerrarModalVer) {
    cerrarModalVer.addEventListener("click", () => {
      modalVer.classList.add("hidden");
    });
  }

  if (btnEliminarCancelar) {
    btnEliminarCancelar.addEventListener("click", () => {
      modalEliminar.classList.add("hidden");
      currentIdToDelete = null;
    });
  }

  if (btnEliminarConfirmar) {
    btnEliminarConfirmar.addEventListener("click", () => {
      if (currentIdToDelete) {
        fetch("/php/server_mensualidades.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=delete&id_mensualidad=${currentIdToDelete}`,
        })
          .then((response) => response.json())
          .then((data) => {
            mostrarMensaje(data.success ? "exito" : "error", data.message);
            if (data.success) {
              fetchMensualidades();
            }
            modalEliminar.classList.add("hidden");
            currentIdToDelete = null;
          })
          .catch((error) => {
            mostrarMensaje(
              "error",
              "Error al eliminar mensualidad. Inténtalo nuevamente."
            );
            console.error("Error:", error);
            modalEliminar.classList.add("hidden");
            currentIdToDelete = null;
          });
      }
    });
  }

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

  // Enviar datos del formulario
  if (dataForm) {
    dataForm.addEventListener("submit", enviarDatos);
  }

  function enviarDatos(event) {
    event.preventDefault();

    const formData = new FormData(dataForm);
    const action = formData.get("id_mensualidad") ? "update" : "add";
    formData.append("action", action);

    fetch("/php/server_mensualidades.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        mostrarMensaje(data.success ? "exito" : "error", data.message);
        if (data.success) {
          modal.classList.add("hidden");
          fetchMensualidades();
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  // Obtener y mostrar todas las mensualidades
  function fetchMensualidades() {
    fetch("/php/server_mensualidades.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        dataTable.innerHTML = "";
        data.forEach((mensualidad) => {
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
                    <div class="py-2 px-4"><span class="font-bold">ID: </span>${mensualidad.id_mensualidad}</div>
                    <div class="py-2 px-4"><span class="font-bold">ID Vehículo: </span>${mensualidad.id_vehiculo}</div>
                    <div class="py-2 px-4"><span class="font-bold">Fecha Inicio: </span>${mensualidad.fecha_inicio}</div>
                    <div class="py-2 px-4"><span class="font-bold">Fecha Fin: </span>${mensualidad.fecha_fin}</div>
                    <div class="py-2 px-4"><span class="font-bold">Monto: </span>${mensualidad.horario_entrada}</div>
                    <div class="py-2 px-4"><span class="font-bold">Monto: </span>${mensualidad.horario_salida}</div>
                    <div class="flex justify-center mt-4 space-x-2">
                        <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewMensualidad(${mensualidad.id_mensualidad})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editMensualidad(${mensualidad.id_mensualidad})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteMensualidad(${mensualidad.id_mensualidad})">
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
          "Error al cargar mensualidades. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  }

  // Editar mensualidad
  window.editMensualidad = function (id) {
    fetch("/php/server_mensualidades.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_mensualidad=${id}`,
    })
      .then((response) => response.json())
      .then((mensualidad) => {
        document.getElementById("id_mensualidad").value =
          mensualidad.id_mensualidad;
        document.getElementById("id_vehiculo").value = mensualidad.id_vehiculo;
        document.getElementById("fecha_inicio").value =
          mensualidad.fecha_inicio;
        document.getElementById("fecha_fin").value = mensualidad.fecha_fin;
        document.getElementById("horario_entrada").value =
          mensualidad.horario_entrada;
        document.getElementById("horario_salida").value =
          mensualidad.horario_salida;
        modal.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar mensualidad. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  // Confirmar eliminación de mensualidad
  window.confirmDeleteMensualidad = function (id) {
    currentIdToDelete = id;
    if (modalEliminar) {
      modalEliminar.classList.remove("hidden");
    }
  };

  // Ver detalles de la mensualidad
  window.viewMensualidad = function (id) {
    fetch("/php/server_mensualidades.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_mensualidad=${id}`,
    })
      .then((response) => response.json())
      .then((mensualidad) => {
        document.getElementById("verId").textContent =
          mensualidad.id_mensualidad;
        document.getElementById("verIdVehiculo").textContent =
          mensualidad.id_vehiculo;
        document.getElementById("verFechaInicio").textContent =
          mensualidad.fecha_inicio;
        document.getElementById("verFechaFin").textContent =
          mensualidad.fecha_fin;
        document.getElementById("verHorarioEntrada").textContent =
          mensualidad.horario_entrada;
        document.getElementById("verHorarioSalida").textContent =
          mensualidad.horario_salida;
        if (modalVer) {
          modalVer.classList.remove("hidden");
        }
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar mensualidad. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  // Mostrar mensaje en el modal de mensajes
  function mostrarMensaje(tipo, mensaje) {
    if (mensajeTexto) {
      mensajeTexto.textContent = mensaje;
    }
    if (modalMensaje) {
      modalMensaje.classList.remove("hidden");
      setTimeout(() => {
        modalMensaje.classList.add("hidden");
      }, 3000);
    }
  }

  // Cargar mensualidades al cargar la página
  fetchMensualidades();
});
