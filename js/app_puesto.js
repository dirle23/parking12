document.addEventListener('DOMContentLoaded', function () {
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
  const estadoSelect = document.getElementById('estado');
  let currentIdToDelete = null;

  // Abrir el modal para agregar un nuevo puesto
  abrirModal.addEventListener('click', () => {
    modal.classList.remove('hidden');
    dataForm.reset();
    document.getElementById('id_puesto').value = '';
    cargarEstados();
  });

  // Cerrar el modal de agregar/editar puesto
  cerrarModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Cerrar el modal de ver puesto
  cerrarModalVer.addEventListener('click', () => {
    modalVer.classList.add('hidden');
  });

  // Cerrar el modal de eliminación
  btnEliminarCancelar.addEventListener('click', () => {
    modalEliminar.classList.add('hidden');
    currentIdToDelete = null;
  });

  // Confirmar eliminación de puesto
  btnEliminarConfirmar.addEventListener('click', () => {
    if (currentIdToDelete) {
      fetch("/php/server_puesto.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=delete&id_puesto=${currentIdToDelete}`,
      })
        .then((response) => response.json())
        .then((data) => {
          mostrarMensaje(data.success ? "exito" : "error", data.message);
          if (data.success) fetchPuestos();  // Recargar los puestos
          modalEliminar.classList.add('hidden');
          currentIdToDelete = null;
        })
        .catch((error) => {
          mostrarMensaje("error", "Error al eliminar puesto. Inténtalo nuevamente.");
          console.error("Error:", error);
          modalEliminar.classList.add('hidden');
          currentIdToDelete = null;
        });
    }
  });

  // Hacer que el modal se cierre al hacer click fuera del mismo
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

  // Enviar datos del formulario (agregar/editar puesto)
  dataForm.addEventListener('submit', enviarDatos);

  function enviarDatos(event) {
    event.preventDefault();

    const formData = new FormData(dataForm);
    const action = formData.get("id_puesto") ? "update" : "add";  // Detectar si es agregar o actualizar
    formData.append("action", action);

    fetch("/php/server_puesto.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        mostrarMensaje(data.success ? "exito" : "error", data.message);
        if (data.success) {
          modal.classList.add('hidden');
          fetchPuestos();  // Recargar los puestos
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  // Obtener puestos desde el servidor
  function fetchPuestos() {
    fetch("/php/server_puesto.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        // Verificar si la respuesta es válida
        if (data.success && Array.isArray(data.puestos)) {
          dataTable.innerHTML = "";  // Limpiar la tabla antes de agregar nuevos puestos.

          data.puestos.forEach((puesto) => {
            // Crear la tarjeta del puesto
            const card = document.createElement("div");
            card.classList.add("bg-white", "border", "border-gray-200", "rounded-lg", "shadow-sm", "p-4");
            card.innerHTML = `
              <div class="py-2 px-4"><span class="font-bold">ID: </span>${puesto.id_puesto}</div>
              <div class="py-2 px-4"><span class="font-bold">Código: </span>${puesto.codigo}</div>
              <div class="py-2 px-4"><span class="font-bold">Ubicación: </span>${puesto.ubicacion}</div>
              <div class="py-2 px-4"><span class="font-bold">Estado: </span>${puesto.estado}</div>
              <div class="flex justify-center mt-4 space-x-2">
                  <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewPuesto(${puesto.id_puesto})">
                      <i class="fas fa-eye"></i>
                  </button>
                  <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editPuesto(${puesto.id_puesto})">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeletePuesto(${puesto.id_puesto})">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
            `;
            dataTable.appendChild(card);
          });
        } else {
          console.error("Error al cargar puestos. La respuesta del servidor no es válida.");
          mostrarMensaje("error", "Error al cargar puestos.");
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al cargar puestos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  // Función para mostrar un mensaje en el modal
  function mostrarMensaje(tipo, mensaje) {
    mensajeTexto.textContent = mensaje;
    modalMensaje.classList.remove('hidden');
    setTimeout(() => {
      modalMensaje.classList.add('hidden');
    }, 3000);
  }

  // Función para cargar los estados en el formulario
  function cargarEstados(selectedEstado = null) {
    fetch("/php/server_puesto.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=get_enum_values",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          estadoSelect.innerHTML = "";
          data.enum_values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            if (value === selectedEstado) {
              option.selected = true;
            }
            estadoSelect.appendChild(option);
          });
        } else {
          mostrarMensaje("error", "Error al cargar los valores de estado.");
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al cargar los valores de estado.");
        console.error("Error:", error);
      });
  }

  window.editPuesto = function (id) {
    fetch("/php/server_puesto.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_puesto=${id}`,
    })
      .then((response) => response.json())
      .then((puesto) => {
        document.getElementById("id_puesto").value = puesto.id_puesto;
        document.getElementById("codigo").value = puesto.codigo;
        document.getElementById("ubicacion").value = puesto.ubicacion;
        cargarEstados(puesto.estado);
        modal.classList.remove('hidden');
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar puesto. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  window.confirmDeletePuesto = function (id) {
    currentIdToDelete = id;
    modalEliminar.classList.remove('hidden');
  };

  window.viewPuesto = function (id) {
    fetch("/php/server_puesto.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_puesto=${id}`,
    })
      .then((response) => response.json())
      .then((puesto) => {
        document.getElementById("verId").textContent = puesto.id_puesto;
        document.getElementById("verCodigo").textContent = puesto.codigo;
        document.getElementById("verUbicacion").textContent = puesto.ubicacion;
        document.getElementById("verEstado").textContent = puesto.estado;
        modalVer.classList.remove('hidden');
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar puesto. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  // Cargar los puestos al cargar la página
  fetchPuestos();
});