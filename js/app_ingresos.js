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
    document.getElementById("id_ingreso").value = "";
    llenarSelectores();
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
      fetch("/php/server_ingreso.php", {
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
          fetchIngresos();
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  function fetchIngresos() {
    fetch("/php/server_ingreso.php", {
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
            <div class="py-2 px-4"><span class="font-bold">ID Vehículo: </span>${ingreso.id_vehiculo}</div>
            <div class="py-2 px-4"><span class="font-bold">ID Puesto: </span>${ingreso.id_puesto}</div>
            <div class="py-2 px-4"><span class="font-bold">Fecha Ingreso: </span>${ingreso.fecha_ingreso}</div>
            <div class="py-2 px-4"><span class="font-bold">Fecha Salida: </span>${ingreso.fecha_salida}</div>
            <div class="py-2 px-4"><span class="font-bold">Tarifa Aplicada: </span>${ingreso.tarifa_aplicada}</div>
            <div class="py-2 px-4"><span class="font-bold">Multa: </span>${ingreso.multa}</div>
            <div class="flex justify-center mt-4 space-x-2">
                
                <button class="flex bg-color5 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="viewIngreso(${ingreso.id_ingreso})"><i class="fas fa-eye"></i></button>
                <button class="flex bg-color6 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="editIngreso(${ingreso.id_ingreso})"><i class="fas fa-edit"></i></button>
                <button class="flex bg-color7 text-white p-2 rounded-normal hover:bg-color6 transition duration-300" onclick="confirmDeleteIngreso(${ingreso.id_ingreso})"><i class="fas fa-trash"></i></button>
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

  window.editIngreso = function (id) {
    fetch("/php/server_ingreso.php", {
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

  window.confirmDeleteIngreso = function (id) {
    currentIdToDelete = id;
    modalEliminar.classList.remove("hidden");
  };

  window.viewIngreso = function (id) {
    fetch("/php/server_ingreso.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_ingreso=${id}`,
    })
      .then((response) => response.json())
      .then((ingreso) => {
        document.getElementById("verId").textContent = ingreso.id_ingreso;
        document.getElementById("verIdVehiculo").textContent = ingreso.id_vehiculo;
        document.getElementById("verIdPuesto").textContent = ingreso.id_puesto;
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

  function mostrarMensaje(tipo, mensaje) {
    mensajeTexto.textContent = mensaje;
    modalMensaje.classList.remove("hidden");
    setTimeout(() => {
      modalMensaje.classList.add("hidden");
    }, 3000);
  }

  function llenarSelectores() {
    fetch("/php/server_vehiculo.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => response.json())
      .then((vehiculos) => {
        const vehiculoSelect = document.getElementById("id_vehiculo");
        vehiculoSelect.innerHTML = "";
        vehiculos.forEach((vehiculo) => {
          const option = document.createElement("option");
          option.value = vehiculo.id_vehiculo;
          option.textContent = `${vehiculo.id_vehiculo} - ${vehiculo.placa}`;
          vehiculoSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error al cargar vehículos:", error);
      });
  
    // Obtener solo los puestos disponibles (estado != 'ocupado')
    fetch("/php/server_puesto.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Verifica la estructura completa de los datos
  
        // Verifica que la respuesta sea un objeto con la propiedad 'puestos' que sea un array
        if (data.success && Array.isArray(data.puestos)) {
          const puestoSelect = document.getElementById("id_puesto");
          puestoSelect.innerHTML = ""; // Limpiar el select
  
          // Filtrar solo los puestos que no están ocupados
          const puestosDisponibles = data.puestos.filter(puesto => puesto.estado !== "ocupado");
  
          // Agregar solo los puestos disponibles al select
          puestosDisponibles.forEach((puesto) => {
            const option = document.createElement("option");
            option.value = puesto.id_puesto;
            option.textContent = `${puesto.id_puesto} - ${puesto.codigo}`;
            puestoSelect.appendChild(option);
          });
        } else {
          console.error("La respuesta no contiene un array en 'puestos':", data);
        }
      })
      .catch((error) => {
        console.error("Error al cargar puestos:", error);
      });
  }
  
  
  fetchIngresos();
});
