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
      document.getElementById('id_puesto').value = '';
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
          fetch('php/server_puesto.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `action=delete&id_puesto=${currentIdToDelete}`
          })
          .then(response => response.json())
          .then(data => {
              mostrarMensaje(data.success ? 'exito' : 'error', data.message);
              if (data.success) fetchPuestos();
              modalEliminar.classList.add('hidden');
              currentIdToDelete = null;
          })
          .catch(error => {
              mostrarMensaje('error', 'Error al eliminar puesto. Inténtalo nuevamente.');
              console.error('Error:', error);
              modalEliminar.classList.add('hidden');
              currentIdToDelete = null;
          });
      }
  });

  window.addEventListener('click', function (event) {
      if (event.target === modal) modal.classList.add('hidden');
      if (event.target === modalVer) modalVer.classList.add('hidden');
      if (event.target === modalEliminar) modalEliminar.classList.add('hidden');
  });

  dataForm.addEventListener('submit', enviarDatos);

  function enviarDatos(event) {
      event.preventDefault();

      const formData = new FormData(dataForm);
      const action = formData.get('id_puesto') ? 'update' : 'add';
      formData.append('action', action);

      fetch('php/server_puesto.php', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          mostrarMensaje(data.success ? 'exito' : 'error', data.message);
          if (data.success) {
              modal.classList.add('hidden');
              fetchPuestos();
          }
      })
      .catch(error => {
          mostrarMensaje('error', 'Error al enviar datos. Inténtalo nuevamente.');
          console.error('Error:', error);
      });
  }

  function fetchPuestos() {
      fetch('php/server_puesto.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=fetch'
      })
      .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.json();
        })
      .then(data => {
          dataTable.innerHTML = '';
          data.forEach(puesto => {
              const row = document.createElement('div');
              row.classList.add('block', 'bg-white', 'md:table-row', 'mb-4', 'md:mb-0', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-4', 'md:p-0');
              row.innerHTML = `
                  <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold hidden">ID: </span>${puesto.id_puesto}</div>
                  <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Codigo: </span>${puesto.codigo}</div>
                  <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Ubicacion: </span>${puesto.ubicacion}</div>
                  <div class="py-2 px-4 block md:table-cell"><span class="md:hidden font-bold">Estado: </span>${puesto.estado}</div>
                  <div class="py-2 px-4 block md:table-cell flex flex-col md:flex-row md:justify-center space-y-2 md:space-y-0 md:space-x-2">
                      <span class="md:hidden font-bold">Acciones: </span>
                      <button class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300" onclick="viewPuesto(${puesto.id_puesto})">Ver</button>
                      <button class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition duration-300" onclick="editPuesto(${puesto.id_puesto})">Editar</button>
                      <button class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300" onclick="confirmDeletePuesto(${puesto.id_puesto})">Eliminar</button>
                  </div>
              `;
              dataTable.appendChild(row);
          });
      })
      .catch(error => {
          mostrarMensaje('error', 'Error al cargar puestos. Inténtalo nuevamente.');
          console.error('Error:', error);
      });
  }

  window.editPuesto = function (id) {
    fetch('php/server_puesto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=fetch&id_puesto=${id}`
    })
    .then(response => response.json())
    .then(puesto => {
        if (puesto && puesto.success !== false) {
            document.getElementById('id_puesto').value = puesto.id_puesto;
            document.getElementById('codigo').value = puesto.codigo;
            document.getElementById('ubicacion').value = puesto.ubicacion;
            const estadoActual = puesto.estado;  

            const estadoSelect = document.getElementById('estado');
            estadoSelect.innerHTML = ''; 

            puesto.enum_values.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state.charAt(0).toUpperCase() + state.slice(1); 

                if (state === estadoActual) option.selected = true
                estadoSelect.appendChild(option);
            });

            document.getElementById('modal').classList.remove('hidden');
        } else {
            mostrarMensaje('error', 'Error al obtener los datos del puesto.');
        }
    })
    .catch(error => {
        mostrarMensaje('error', 'Error al cargar puesto. Inténtalo nuevamente.');
        console.error('Error:', error);
    });
};



  window.confirmDeletePuesto = function (id) {
      currentIdToDelete = id;
      modalEliminar.classList.remove('hidden');
  };

  window.viewPuesto = function (id) {
      fetch('php/server_puesto.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `action=fetch&id_puesto=${id}`
      })
      .then(response => response.json())
      .then(puesto => {
          document.getElementById('verId').textContent = puesto.id_puesto;
          document.getElementById('verCodigo').textContent = puesto.codigo;
          document.getElementById('verUbicacion').textContent = puesto.ubicacion;
          document.getElementById('verEstado').textContent = puesto.estado;
          modalVer.classList.remove('hidden');
      })
      .catch(error => {
          mostrarMensaje('error', 'Error al cargar puesto. Inténtalo nuevamente.');
          console.error('Error:', error);
      });
  };

  function mostrarMensaje(tipo, mensaje) {
      mensajeTexto.textContent = mensaje;
      modalMensaje.classList.remove('hidden');
      setTimeout(() => {
          modalMensaje.classList.add('hidden');
      }, 3000);
  }

  fetchPuestos();
});