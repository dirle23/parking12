document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const abrirModal = document.getElementById('openModal');
    const cerrarModal = document.getElementById('closeModal');
    const dataForm = document.getElementById('dataForm');
    const dataTable = document.getElementById('dataTable');
    const modalMensaje = document.getElementById('modalMensaje');
    const mensajeTexto = document.getElementById('mensajeTexto');
    const modalEliminar = document.getElementById('modalEliminar');
    const btnEliminarConfirmar = document.getElementById('btnEliminarConfirmar');
    const btnEliminarCancelar = document.getElementById('btnEliminarCancelar');
    let currentId = null;

    abrirModal.addEventListener('click', () => {
        modal.classList.remove('hidden');
        dataForm.reset();
        document.getElementById('id_permiso').value = '';
        cargarUsuarios();
    });

    cerrarModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    btnEliminarCancelar.addEventListener('click', () => {
        modalEliminar.classList.add('hidden');
        currentId = null;
    });

    btnEliminarConfirmar.addEventListener('click', () => {
        if (currentId) {
            deletePermiso();
        }
    });

    dataForm.addEventListener('submit', enviarDatos);

    function enviarDatos(event) {
        event.preventDefault();

        const formData = new FormData(dataForm);
        const action = formData.get('id_permiso') ? 'update' : 'add';
        formData.append('action', action);

        fetch('https://aplicacionessena.com/server_permisos_usuario.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.success ? 'exito' : 'error', data.message);
            if (data.success) {
                modal.classList.add('hidden');
                fetchPermisosUsuario();
            }
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al enviar datos. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    function fetchPermisosUsuario() {
        fetch('https://aplicacionessena.com/server_permisos_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch'
        })
        .then(response => response.json())
        .then(data => {
            dataTable.innerHTML = '';
            data.forEach(permiso => {
                const row = document.createElement('div');
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
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">ID: </span>${permiso.id_permiso}</div>
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Usuario: </span>${permiso.nombre_usuario}</div>
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Crear: </span>${permiso.permisos.includes('crear') ? 'X' : ''}</div>
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Ver: </span>${permiso.permisos.includes('ver') ? 'X' : ''}</div>
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Editar: </span>${permiso.permisos.includes('editar') ? 'X' : ''}</div>
                    <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Eliminar: </span>${permiso.permisos.includes('eliminar') ? 'X' : ''}</div>
                    <div class="py-2 px-4 block md:table-cell flex flex-col md:flex-row md:justify-center space-y-2 md:space-y-0 md:space-x-2">
                        <span class="md:hidden font-bold">Acciones: </span>
                        <button class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-700 transition duration-300" onclick="editPermiso(${permiso.id_permiso})">Editar</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700 transition duration-300" onclick="confirmDeletePermiso(${permiso.id_permiso})">Eliminar</button>
                    </div>
                `;
                dataTable.appendChild(row);
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar permisos de usuario. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    window.editPermiso = function (id) {
        fetch('https://aplicacionessena.com/server_permisos_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=fetch&id_permiso=${id}`
        })
        .then(response => response.json())
        .then(permiso => {
            cargarUsuarios().then(() => {
                document.getElementById('id_permiso').value = permiso.id_permiso;
                document.getElementById('id_usuario').value = permiso.id_usuario;
                const permisos = permiso.permisos.split(',');
                permisos.forEach(p => {
                    document.querySelector(`input[name="permisos[]"][value="${p}"]`).checked = true;
                });
                modal.classList.remove('hidden');
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar permiso de usuario. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    };

    window.confirmDeletePermiso = function (id) {
        currentId = id;
        modalEliminar.classList.remove('hidden');
    };

    function deletePermiso() {
        fetch('https://aplicacionessena.com/server_permisos_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=delete&id_permiso=${currentId}`
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.success ? 'exito' : 'error', data.message);
            if (data.success) {
                fetchPermisosUsuario();
            }
            modalEliminar.classList.add('hidden');
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al eliminar permiso de usuario. Inténtalo nuevamente.');
            console.error('Error:', error);
        });
    }

    function cargarUsuarios() {
        return fetch('https://aplicacionessena.com/server_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch'
        })
        .then(response => response.json())
        .then(data => {
            const usuarioSelect = document.getElementById('id_usuario');
            usuarioSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
            data.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.id;
                option.textContent = usuario.nombre;
                usuarioSelect.appendChild(option);
            });
        })
        .catch(error => {
            mostrarMensaje('error', 'Error al cargar usuarios. Inténtalo nuevamente.');
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

    fetchPermisosUsuario();
});