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
    let currentIdToDelete = null;

    abrirModal.addEventListener('click', () => {
        modal.classList.remove('hidden');
        dataForm.reset();
        document.getElementById('id').value = '';
        cargarProductos();
    });

    cerrarModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    cerrarModalVer.addEventListener('click', () => {
        modalVer.classList.add('hidden');
    });

    btnEliminarCancelar.addEventListener('click', () => {
        modalEliminar.classList.add('hidden');
        currentIdToDelete = null;
    });

    btnEliminarConfirmar.addEventListener('click', () => {
        if (currentIdToDelete) {
            fetch('php/server_detalle_factura.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=delete&id=${currentIdToDelete}`
            })
            .then(response => response.json())
            .then(data => {
                mostrarMensaje(data.success ? 'exito' : 'error', data.message);
                if (data.success) {
                    fetchDetallesFactura();
                }
                modalEliminar.classList.add('hidden');
                currentIdToDelete = null;
            })
            .catch(error => {
                mostrarMensaje('error', 'Error al eliminar detalle de factura. Inténtalo nuevamente.');
                console.error('Error:', error);
                modalEliminar.classList.add('hidden');
                currentIdToDelete = null;
            });
        }
    });

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

    dataForm.addEventListener('submit', enviarDatos);

    function enviarDatos(event) {
        event.preventDefault();

        const formData = new FormData(dataForm);
        const action = formData.get('id') ? 'update' : 'add';
        formData.append('action', action);

        fetch('php/server_detalle_factura.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.success ? 'exito' : 'error', data.message);
            if (data.success) {
                modal.classList.add('hidden');
                fetchDetallesFactura();
            }
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al enviar datos. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    function fetchDetallesFactura() {
        fetch('php/server_detalle_factura.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch'
        })
        .then(response => response.json())
        .then(data => {
            dataTable.innerHTML = '';
            data.forEach(detalle => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="py-2">${detalle.id_detalle}</td>
                    <td class="py-2">${detalle.id_factura}</td>
                    <td class="py-2">${detalle.nombre_producto}</td>
                    <td class="py-2">${detalle.cantidad}</td>
                    <td class="py-2">${detalle.precio_unitario}</td>
                    <td class="py-2">${detalle.subtotal}</td>
                    <td class="py-2">
                        <button class="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-700" onclick="viewDetalle(${detalle.id_detalle})">Ver</button>
                        <button class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-700" onclick="editDetalle(${detalle.id_detalle})">Editar</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700" onclick="confirmDeleteDetalle(${detalle.id_detalle})">Eliminar</button>
                    </td>
                `;
                dataTable.appendChild(row);
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar detalles de factura. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    window.editDetalle = function (id) {
        fetch('php/server_detalle_factura.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=fetch&id=${id}`
        })
        .then(response => response.json())
        .then(detalle => {
            cargarProductos(detalle.id_producto).then(() => {
                document.getElementById('id').value = detalle.id_detalle;
                document.getElementById('id_factura').value = detalle.id_factura;
                document.getElementById('id_producto').value = detalle.id_producto;
                document.getElementById('cantidad').value = detalle.cantidad;
                document.getElementById('precio_unitario').value = detalle.precio_unitario;
                modal.classList.remove('hidden');
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar detalle de factura. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    };

    window.confirmDeleteDetalle = function (id) {
        currentIdToDelete = id;
        modalEliminar.classList.remove('hidden');
    };

    window.viewDetalle = function (id) {
        fetch('php/server_detalle_factura.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=fetch&id=${id}`
        })
        .then(response => response.json())
        .then(detalle => {
            document.getElementById('verId').textContent = detalle.id_detalle;
            document.getElementById('verIdFactura').textContent = detalle.id_factura;
            document.getElementById('verNombreProducto').textContent = detalle.nombre_producto;
            document.getElementById('verCantidad').textContent = detalle.cantidad;
            document.getElementById('verPrecioUnitario').textContent = detalle.precio_unitario;
            document.getElementById('verSubtotal').textContent = detalle.subtotal;
            modalVer.classList.remove('hidden');
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar detalle de factura. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    };

    function cargarProductos(selectedId = null) {
        return fetch('php/server_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch'
        })
        .then(response => response.json())
        .then(data => {
            const selectProducto = document.getElementById('id_producto');
            selectProducto.innerHTML = '<option value="">Selecciona un producto</option>';
            data.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id_producto;
                option.textContent = producto.nombre;
                if (selectedId && selectedId == producto.id_producto) {
                    option.selected = true;
                }
                selectProducto.appendChild(option);
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar productos. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    function mostrarMensaje(tipo, mensaje) {
        mensajeTexto.textContent = mensaje;
        modalMensaje.classList.remove('hidden');
        setTimeout(() => {
            modalMensaje.classList.add('hidden');
        }, 3000);
    }

    fetchDetallesFactura();
});