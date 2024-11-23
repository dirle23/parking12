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
    document.getElementById("id").value = "";
    cargarSelectores();
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
      fetch("https://aplicacionessena.com/server_factura.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=delete&id=${currentIdToDelete}`,
      })
        .then((response) => response.json())
        .then((data) => {
          mostrarMensaje(data.success ? "exito" : "error", data.message);
          if (data.success) {
            fetchFacturas();
          }
          modalEliminar.classList.add("hidden");
          currentIdToDelete = null;
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al eliminar factura. Inténtalo nuevamente."
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
    const action = formData.get("id") ? "update" : "add";
    formData.append("action", action);

    fetch("https://aplicacionessena.com/server_factura.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        mostrarMensaje(data.success ? "exito" : "error", data.message);
        if (data.success) {
          modal.classList.add("hidden");
          fetchFacturas();
        }
      })
      .catch((error) => {
        mostrarMensaje("error", "Error al enviar datos. Inténtalo nuevamente.");
        console.error("Error:", error);
      });
  }

  function fetchFacturas() {
    fetch("https://aplicacionessena.com/server_factura.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=fetch",
    })
      .then((response) => response.json())
      .then((data) => {
        dataTable.innerHTML = "";
        data.forEach((factura) => {
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
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">ID: </span>${factura.id_factura}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Cliente: </span>${factura.cliente}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Usuario: </span>${factura.usuario}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Fecha: </span>${factura.fecha}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Producto: </span>${factura.producto}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Cantidad: </span>${factura.cantidad}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Precio: </span>${formatearPrecio(factura.precio_unitario)}</div>
            <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Total: </span>${formatearPrecio(factura.total)}</div>
            <div class="py-2 px-4 block md:table-cell flex flex-col md:flex-row md:justify-center space-y-2 md:space-y-0 md:space-x-2">
                <span class="md:hidden font-bold">Acciones: </span>
                <button class="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-700 transition duration-300" onclick="viewFactura(${factura.id_factura})">Ver</button>
                <button class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-700 transition duration-300" onclick="editFactura(${factura.id_factura})">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700 transition duration-300" onclick="confirmDeleteFactura(${factura.id_factura})">Eliminar</button>
            </div>
          `;
          dataTable.appendChild(row);
        });
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar facturas. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  }

  window.editFactura = function (id) {
    fetch("https://aplicacionessena.com/server_factura.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id=${id}`,
    })
      .then((response) => response.json())
      .then((factura) => {
        cargarSelectores().then(() => {
          document.getElementById("id").value = factura.id_factura;
          document.getElementById("cliente_id").value = factura.id_cliente;
          document.getElementById("usuario_id").value = factura.id_usuario;
          let fechaOriginal = factura.fecha;
          let fecha = new Date(fechaOriginal);
          let dia = fecha.getDate();
          let mes = fecha.getMonth() + 1;
          let año = fecha.getFullYear();
          dia = dia < 10 ? "0" + dia : dia;
          mes = mes < 10 ? "0" + mes : mes;
          let fechaFormateada = `${año}-${mes}-${dia}`;
          document.getElementById("fecha").value = fechaFormateada;
          document.getElementById("id_producto").value = factura.id_producto;
          document.getElementById("cantidad").value = factura.cantidad;
          modal.classList.remove("hidden");
        });
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar factura. Inténtalo nuevamente."
        );
        console.error("Error:", error);
      });
  };

  window.confirmDeleteFactura = function (id) {
    currentIdToDelete = id;
    modalEliminar.classList.remove("hidden");
  };

  window.viewFactura = function (id) {
    fetch("https://aplicacionessena.com/server_factura.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id=${id}`,
    })
      .then((response) => response.json())
      .then((factura) => {
        document.getElementById("verId").textContent = factura.id_factura;
        document.getElementById("verCliente").textContent = factura.cliente;
        document.getElementById("verUsuario").textContent = factura.usuario;
        document.getElementById("verFecha").textContent = factura.fecha;
        document.getElementById("verProducto").textContent = factura.producto;
        document.getElementById("verCantidad").textContent = factura.cantidad;
        document.getElementById("verPrecioUnitario").textContent = formatearPrecio(factura.precio_unitario);
        document.getElementById("verTotal").textContent = formatearPrecio(factura.total);
        modalVer.classList.remove("hidden");
      })
      .catch((error) => {
        mostrarMensaje(
          "error",
          "Error al cargar factura. Inténtalo nuevamente."
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

  function cargarSelectores() {
    return Promise.all([
      fetch("https://aplicacionessena.com/server_cliente.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=fetch",
      })
        .then((response) => response.json())
        .then((data) => {
          const clienteSelect = document.getElementById("cliente_id");
          clienteSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
          data.forEach((cliente) => {
            const option = document.createElement("option");
            option.value = cliente.id_cliente;
            option.textContent = cliente.nombre;
            clienteSelect.appendChild(option);
          });
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al cargar clientes. Inténtalo nuevamente."
          );
          console.error("Error:", error);
        }),

      fetch("https://aplicacionessena.com/server_usuario.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=fetch",
      })
        .then((response) => response.json())
        .then((data) => {
          const usuarioSelect = document.getElementById("usuario_id");
          usuarioSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
          data.forEach((usuario) => {
            const option = document.createElement("option");
            option.value = usuario.id;
            option.textContent = usuario.nombre;
            usuarioSelect.appendChild(option);
          });
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al cargar usuarios. Inténtalo nuevamente."
          );
          console.error("Error:", error);
        }),

      fetch("https://aplicacionessena.com/server_producto.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=fetch",
      })
        .then((response) => response.json())
        .then((data) => {
          const productoSelect = document.getElementById("id_producto");
          productoSelect.innerHTML = '<option value="">Selecciona un producto</option>';
          data.forEach((producto) => {
            const option = document.createElement("option");
            option.value = producto.id_producto;
            option.textContent = producto.nombre;
            productoSelect.appendChild(option);
          });
        })
        .catch((error) => {
          mostrarMensaje(
            "error",
            "Error al cargar productos. Inténtalo nuevamente."
          );
          console.error("Error:", error);
        }),
    ]);
  }

  function formatearPrecio(precio) {
    return precio.toLocaleString("es-ES", { minimumFractionDigits: 0 });
  }

  fetchFacturas();
});