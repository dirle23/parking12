document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownContent = document.getElementById('dropdownContent');
    const openModal = document.getElementById('openModal');
    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('modal');
    


    // Cierra el dropdown si se hace clic fuera de él
    window.addEventListener('click', function (event) {
        if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.classList.add('hidden');
        }
    });

    // Abre el modal
    openModal.addEventListener('click', function () {
        modal.classList.remove('hidden');
        document.getElementById('dataForm').reset();  // Limpiar formulario
        document.getElementById('id').value = ''; // Limpiar ID para nuevo registro
    });

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
});