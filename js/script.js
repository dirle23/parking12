document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownContent = document.getElementById('dropdownContent');
    const openModal = document.getElementById('openModal');
    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('modal');
    const dataForm = document.getElementById('dataForm');
    const idField = document.getElementById('id'); // Asegúrate de que este ID exista en el DOM

    // Verificar que los elementos existen antes de agregar event listeners
    if (dropdownButton && dropdownContent) {
        // Cierra el dropdown si se hace clic fuera de él
        window.addEventListener('click', function (event) {
            if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.classList.add('hidden');
            }
        });
    }

    if (openModal && modal) {
        // Abre el modal
        openModal.addEventListener('click', function () {
            modal.classList.remove('hidden');
            if (dataForm) {
                dataForm.reset();  // Limpiar formulario
            }
            if (idField) {
                idField.value = ''; // Limpiar ID para nuevo registro
            }
        });
    }

    if (closeModal && modal) {
        // Cierra el modal
        closeModal.addEventListener('click', function () {
            modal.classList.add('hidden');
        });

        // Cierra el modal al hacer clic fuera de él
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});