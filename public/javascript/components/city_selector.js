import { ciudadesEcuador } from "../consts/cities.js";
import { cargarDatosCiudad } from "../load_data.js";

/* Carga de Selector de Ciudad para muestra de Datos */
function mostrarDatos(event) {
	const boton = document.getElementById("btn-mostrar-datos");
	const selectProvincia = document.getElementById("selector-provincia").value;
	const selectCiudad = event.target.value;

	if (selectCiudad == "Seleccione ciudad") {
		boton.disabled = true;
		return;
	} else {
		boton.disabled = false;
	}
	boton.onclick = function () {
		cargarDatosCiudad(selectProvincia, selectCiudad);
	};
}

export function cargarSelectorProvincia() {
	const selector_provincia = document.getElementById("selector-provincia");
	const provincias = [];
	ciudadesEcuador.forEach(function (ciudad) {
		provincias.push(ciudad.provincia);
	});
	selector_provincia.innerHTML = "<option selected>Seleccione provincia</option>";
	añadirItems(selector_provincia, provincias);
	selector_provincia.addEventListener("change", cargarSelectorCiudad);
}

function cargarSelectorCiudad(event) {
	const selector_ciudad = document.getElementById("selector-ciudad");
	const provincia = event.target.value;

	selector_ciudad.innerHTML = "<option selected>Seleccione ciudad</option>";
	document.getElementById("btn-mostrar-datos").disabled = true;
	if (provincia == "Seleccione provincia") {
		selector_ciudad.disabled = true;
		return;
	}
	selector_ciudad.disabled = false;
	const ciudades = cargarListaCiudadesProvincia(provincia);
	añadirItems(selector_ciudad, ciudades);
	selector_ciudad.addEventListener("change", mostrarDatos);
}

//Carga lista de Ciudades
function cargarListaCiudadesProvincia(nombreProvincia) {
	const ciudades = [];
	ciudadesEcuador.forEach(function (provincia) {
		if (provincia.provincia == nombreProvincia)
			provincia.ciudades.forEach(function (ciudad) {
				ciudades.push(ciudad.name);
			});
	});
	return ciudades;
}

function añadirItems(selector, lista) {
	lista.forEach(function (item) {
		selector.innerHTML += `<option>${item}</option>`;
	});
}
