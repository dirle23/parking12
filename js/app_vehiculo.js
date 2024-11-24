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
      fetch("/php/server_vehiculo.php", {
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

    fetch("/php/server_vehiculo.php", {
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
    fetch("/php/server_vehiculo.php", {
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
            <div class="py-2 px-4"><span class="font-bold">ID: </span>${vehiculo.id_vehiculo}</div>
            <div class="py-2 px-4"><span class="font-bold">Placa: </span>${vehiculo.placa}</div>
            <div class="py-2 px-4"><span class="font-bold">Tipo: </span>${vehiculo.tipo}</div>
            <div class="py-2 px-4"><span class="font-bold">Propietario: </span>${vehiculo.propietario}</div>
            <div class="flex justify-center mt-4 space-x-2">
                <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewVehiculo(${vehiculo.id_vehiculo})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editVehiculo(${vehiculo.id_vehiculo})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteVehiculo(${vehiculo.id_vehiculo})">
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
          "Error al cargar vehículos. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  }

  window.editVehiculo = function (id) {
    fetch("/php/server_vehiculo.php", {
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
    fetch("/php/server_vehiculo.php", {
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