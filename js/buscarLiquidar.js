
    function buscarVehiculo() {
        const placa = document.getElementById("search-placa").value;

        if (!placa) {
            alert("Por favor, ingresa una placa.");
            return;
        }

        fetch("./php/liquidar_formulario.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `action=getVehiculo&placa=${encodeURIComponent(placa)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Autocompletar los campos con los datos del vehículo
                const vehiculo = data.vehiculo;
                document.getElementById("tipoVehiculo").value = vehiculo.tipo;
                document.getElementById("placa").value = placa;
                document.getElementById("propietario").value = vehiculo.propietario;
                document.getElementById("fechaIngreso").value = vehiculo.fecha_ingreso.split(' ')[0];
                document.getElementById("horaIngreso").value = vehiculo.fecha_ingreso.split(' ')[1];
                document.getElementById("puesto").value = vehiculo.codigo_puesto;
                document.getElementById("tarifa").value = vehiculo.tarifa;
            } else {
                alert(data.message || "No se encontró el vehículo.");
            }
        })
        .catch(error => {
            console.error("Error al buscar el vehículo:", error);
            alert("Ocurrió un error al buscar el vehículo.");
        });
    }
