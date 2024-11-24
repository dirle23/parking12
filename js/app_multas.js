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
    let currentIdToDelete = null;
  
    // Abrir el modal para agregar un registro
    abrirModal.addEventListener("click", () => {
      modal.classList.remove("hidden");
      dataForm.reset();
      document.getElementById("id_multa").value = "";
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
        fetch("/php/server_multa.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=delete&id_multa=${currentIdToDelete}`,
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
      const action = formData.get("id_multa") ? "update" : "add";
      formData.append("action", action);
  
      fetch("/php/server_multa.php", {
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
      fetch("/php/server_multa.php", {
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
              <div class="py-2 px-4 block md:table-cell">${registro.id_multa}</div>
              <div class="py-2 px-4 block md:table-cell">${registro.id_ingreso}</div>
              <div class="py-2 px-4 block md:table-cell">${registro.monto}</div>
              <div class="py-2 px-4 block md:table-cell">${registro.fecha_generada}</div>
              <div class="py-2 px-4 block md:table-cell">${registro.pagada ? "Sí" : "No"}</div>
              <div class="py-2 px-4 block md:table-cell">
                  <button class="bg-green-500 text-white px-2 py-1 rounded-md" onclick="viewRegistro(${registro.id_multa})">Ver</button>
                  <button class="bg-yellow-500 text-white px-2 py-1 rounded-md" onclick="editRegistro(${registro.id_multa})">Editar</button>
                  <button class="bg-red-500 text-white px-2 py-1 rounded-md" onclick="confirmDeleteRegistro(${registro.id_multa})">Eliminar</button>
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
  
    // Función para mostrar mensajes
    function mostrarMensaje(tipo, mensaje) {
      mensajeTexto.textContent = mensaje;
      modalMensaje.classList.remove("hidden");
      setTimeout(() => {
        modalMensaje.classList.add("hidden");
      }, 3000);
    }
  
    // Función para ver un registro
    window.viewRegistro = function (id_multa) {
      fetch("/php/server_multa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=fetch&id_multa=${id_multa}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            document.getElementById("verIdMulta").textContent = data.id_multa;
            document.getElementById("verIdIngreso").textContent = data.id_ingreso;
            document.getElementById("verMonto").textContent = data.monto;
            document.getElementById("verFechaGenerada").textContent = data.fecha_generada;
            document.getElementById("verPagada").textContent = data.pagada ? "Sí" : "No";
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
    window.editRegistro = function (id_multa) {
      fetch("/php/server_multa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=fetch&id_multa=${id_multa}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            document.getElementById("id_multa").value = data.id_multa;
            document.getElementById("id_ingreso").value = data.id_ingreso;
            document.getElementById("monto").value = data.monto;
            document.getElementById("fecha_generada").value = data.fecha_generada;
            document.getElementById("pagada").value = data.pagada ? "true" : "false";
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
    window.confirmDeleteRegistro = function (id_multa) {
      currentIdToDelete = id_multa;
      modalEliminar.classList.remove("hidden");
    };
  
    // Cargar los registros al cargar la página
    fetchRegistros();
  });