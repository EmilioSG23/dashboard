import { ciudadesEcuador } from "./consts/cities.js";
import { API_INDICATOR, API_KEY, API_PREDICTIONS, RESPONSE_MODES } from "./consts/consts.js";
import { ciudad_activado, provincia_activado } from "./dashboard.js";
import { cargarPronostico } from "./sections/forecasts.js";
import { cargarGrafico } from "./sections/graphics.js";
import { cargarIndicadores } from "./sections/indicators.js";

const responseAsync = async (URL, mode) => {
	try {
		const response = await fetch(URL);
		if (mode === RESPONSE_MODES.XML) return await response.text();
		if (mode === RESPONSE_MODES.JSON) return await response.json();
		return null;
	} catch (error) {
		console.log(error);
	}
	return null;
};
const responseJSONAsync = async (URL) => {
	return responseAsync(URL, RESPONSE_MODES.JSON);
};

const responseTextAsync = async (URL) => {
	return responseAsync(URL, RESPONSE_MODES.XML);
};

const removeAllItemsFromLS = (name) => {
	Object.keys(localStorage).forEach((item) => {
		if (item.startsWith(name)) localStorage.removeItem(item);
	});
};

/* Obtención de Objetos: Provincia y Ciudad */
const obtenerProvincia = (nombre) => {
	let provinciaObjeto;
	ciudadesEcuador.forEach((provincia) => {
		if (provincia.provincia === nombre) provinciaObjeto = provincia;
	});
	return provinciaObjeto;
};

let obtenerCiudad = (nombreProvincia, nombreCiudad) => {
	let ciudadObjeto;
	let provincia = obtenerProvincia(nombreProvincia);
	provincia.ciudades.forEach((ciudad) => {
		if (ciudad.name == nombreCiudad) ciudadObjeto = ciudad;
	});
	return ciudadObjeto;
};

export const obtenerCiudadActivado = () => {
	return obtenerCiudad(provincia_activado, ciudad_activado);
};

/* Carga de datos de la ciudad en el documento */
let cargarNombreCiudad = (ciudad) => {
	document.getElementById("ciudad-header").textContent = ciudad;
};

export const cargarDatosCiudad = (nombreProvincia, nombreCiudad) => {
	let provincia = obtenerProvincia(nombreProvincia);
	let ciudad = obtenerCiudad(nombreProvincia, nombreCiudad);

	cargarDatos(provincia, ciudad);
	cargarNombreCiudad(ciudad.name);

	provincia_activado = nombreProvincia;
	ciudad_activado = nombreCiudad;
};

let cargarDatos = async (provincia, ciudad) => {
	cargarIndicadores(ciudad);
	await cargarGrafico(ciudad);
	cargarPronostico(provincia, ciudad);

	localStorage.setItem("provincia-activado", provincia.provincia);
	localStorage.setItem("ciudad-activado", ciudad.name);
};

/* Actualización de Datos Automáticos */
export const actualizarDatos = () => {
	actualizarIndicadoresGraficos();
	actualizarPronostico();
	actualizarMonitoreo();

	if (localStorage.getItem("") != null) localStorage.removeItem("");

	setInterval(actualizarDatos, 1000);
};

let actualizarIndicadoresGraficos = () => {
	let hoy = new Date();
	let actualizarDate = new Date();
	actualizarDate.setHours(0);
	actualizarDate.setMinutes(0);
	actualizarDate.setSeconds(30);
	actualizarDate.setMilliseconds(0);

	if (hoy.getTime() == actualizarDate.getTime()) location.reload();
};

let actualizarPronostico = () => {
	let lastUpdate = new Date(localStorage.getItem("last-update-prediccion"));

	if (lastUpdate.getTime() == 0) return;

	let actualizarDate = new Date();
	actualizarDate.setHours(actualizarDate.getHours() - (actualizarDate.getHours() % 3));
	actualizarDate.setMinutes(0);
	actualizarDate.setSeconds(45);

	if (lastUpdate < actualizarDate) {
		console.log("Se actualizó pronóstico");
		removeAllItemsFromLS("Pronostico ");
		cargarPronostico(obtenerProvincia(provincia_activado), obtenerCiudad(provincia_activado, ciudad_activado));
	}
};

let actualizarMonitoreo = () => {
	let hoy = new Date();
	let lastUpdate = new Date(localStorage.getItem("last-update-monitoreo"));

	if (lastUpdate.getTime() == 0) return;

	let actualizarDate = new Date();
	actualizarDate.setHours(7);
	actualizarDate.setMinutes(1);
	actualizarDate.setSeconds(0);

	if (lastUpdate < actualizarDate && hoy > actualizarDate) {
		console.log("Se actualizó monitoreo");
		removeAllItemsFromLS("Monitoreo del");
		cargarMonitoreo();
	}
};

export async function obtainCityDatas(city) {
	const url =
		API_INDICATOR +
		"latitude=" +
		city.latitude.toString() +
		"&longitude=" +
		city.longitude.toString() +
		"&hourly=temperature_2m,precipitation,uv_index" +
		"&hourly=precipitation,precipitation_probability" +
		"&daily=precipitation_probability_max" +
		"&hourly=uv_index,uv_index_clear_sky" +
		"&daily=uv_index_max,uv_index_clear_sky_max" +
		"&hourly=temperature_2m" +
		"&daily=temperature_2m_max,temperature_2m_min" +
		"&timezone=auto";
	return await responseJSONAsync(url);
}

export async function obtainCityPredictions(city) {
	const url = API_PREDICTIONS + `lat=${city.latitude}&lon=${city.longitude}&mode=xml&appid=${API_KEY}`;
	return await responseTextAsync(url);
}
