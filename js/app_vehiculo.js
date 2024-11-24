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

  abrirModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
    dataForm.reset();
    document.getElementById("id_vehiculo").value = "";
  });

  cerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  cerrarModalVer.addEventListener("click", () => {
    modalVer.classList.add("hidden");
  });

  btnEliminarCancelar.addEventListener("click", () => {
    modalEliminar.classList.add("hidden");
    currentIdToDelete = null;
  });

  btnEliminarConfirmar.addEventListener("click", () => {
    if (currentIdToDelete) {
      fetch("php/server_vehiculo.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=delete&id_vehiculo=${currentIdToDelete}`,
      })
        .then((response) => response.json())
        .then((data) => {
          mostrarMensaje(data.success ? "exito" : "error", data.message);
          if (data.success) fetchVehiculos();
          
          modalEliminar.classList.add("hidden");
          currentIdToDelete = null;
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al eliminar vehículo. Inténtalo nuevamente."
          );
          console.error("Error:", error);
          modalEliminar.classList.add("hidden");
          currentIdToDelete = null;
        });
    }
  });

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

  dataForm.addEventListener("submit", enviarDatos);

  function enviarDatos(event) {
    event.preventDefault();

    const formData = new FormData(dataForm);
    const action = formData.get("id_vehiculo") ? "update" : "add";
    formData.append("action", action);

    fetch("php/server_vehiculo.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        mostrarMensaje(data.success ? "exito" : "error", data.message);
        if (data.success) {
          modal.classList.add("hidden");
          fetchVehiculos();
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  function fetchVehiculos() {
    fetch("php/server_vehiculo.php", {
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
        data.forEach((vehiculo) => {
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
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">ID: </span>${vehiculo.id_vehiculo}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Placa: </span>${vehiculo.placa}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Tipo: </span>${vehiculo.tipo}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Propietario: </span>${vehiculo.propietario}</div>
            <div class="py-2 px-4 block md:table-cell flex flex-col md:flex-row md:justify-center space-y-2 md:space-y-0 md:space-x-2">
                <span class="md:hidden font-bold">Acciones: </span>
                <button class="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-700 transition duration-300" onclick="viewVehiculo(${vehiculo.id_vehiculo})">Ver</button>
                <button class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-700 transition duration-300" onclick="editVehiculo(${vehiculo.id_vehiculo})">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700 transition duration-300" onclick="confirmDeleteVehiculo(${vehiculo.id_vehiculo})">Eliminar</button>
            </div>
          `;
          dataTable.appendChild(row);
        });
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar vehículos. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  }

  window.editVehiculo = function (id) {
    fetch("php/server_vehiculo.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_vehiculo=${id}`,
    })
      .then((response) => response.json())
      .then((vehiculo) => {
        document.getElementById("id_vehiculo").value = vehiculo.id_vehiculo;
        document.getElementById("placa").value = vehiculo.placa;
        document.getElementById("tipo").value = vehiculo.tipo;
        modal.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar vehículo. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  window.confirmDeleteVehiculo = function (id) {
    currentIdToDelete = id;
    modalEliminar.classList.remove("hidden");
  };

  window.viewVehiculo = function (id) {
    fetch("php/server_vehiculo.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_vehiculo=${id}`,
    })
      .then((response) => response.json())
      .then((vehiculo) => {
        document.getElementById("verId").textContent = vehiculo.id_vehiculo;
        document.getElementById("verPlaca").textContent = vehiculo.placa;
        document.getElementById("verTipo").textContent = vehiculo.tipo;
        modalVer.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar vehículo. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  function mostrarMensaje(tipo, mensaje) {
    mensajeTexto.textContent = mensaje;
    modalMensaje.classList.remove("hidden");
    setTimeout(() => {
      modalMensaje.classList.add("hidden");
    }, 3000);
  }

  fetchVehiculos();
});