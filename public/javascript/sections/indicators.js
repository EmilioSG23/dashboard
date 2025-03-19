import { fechaActual } from "../components/dates.js";
import { obtainCityDatas } from "../load_data.js";

/* Carga de Indicadores de Precipitación, UV y Temperatura */
function calcularIndicador(tiempo, datos) {
	let temp = [];
	for (let i = 0; i < tiempo.length; i++) {
		if (tiempo[i].includes(fechaActual())) temp.push(datos[i]);
	}

	let sum = temp.reduce((a, b) => a + b, 0);

	let indicador = {
		max: Math.max(...temp),
		min: Math.min(...temp),
		prom: sum / temp.length || 0,
	};

	return indicador;
}

function cargarPrecipitacion(tiempo, datos) {
	let prec = calcularIndicador(tiempo, datos);

	document.getElementById("precipitacionMinValue").textContent = `Min ${prec.min} [mm]`;
	document.getElementById("precipitacionPromValue").textContent = `Prom ${Math.round(prec.prom * 100) / 100} [mm]`;
	document.getElementById("precipitacionMaxValue").textContent = `Max ${prec.max} [mm]`;
}

function cargarUV(tiempo, datos) {
	let uv = calcularIndicador(tiempo, datos);

	document.getElementById("uvMinValue").textContent = `Min ${uv.min} [--]`;
	document.getElementById("uvPromValue").textContent = `Prom ${Math.round(uv.prom * 100) / 100} [--]`;
	document.getElementById("uvMaxValue").textContent = `Max ${uv.max} [--]`;
}

function cargarTemperatura(tiempo, datos) {
	let temperatura = calcularIndicador(tiempo, datos);

	document.getElementById("temperaturaMinValue").textContent = `Min ${temperatura.min} [°C]`;
	document.getElementById("temperaturaPromValue").textContent = `Prom ${
		Math.round(temperatura.prom * 100) / 100
	} [°C]`;
	document.getElementById("temperaturaMaxValue").textContent = `Max ${temperatura.max} [°C]`;
}

export async function cargarIndicadores(ciudad) {
	const datosCiudad = await obtainCityDatas(ciudad);

	const datosTiempo = datosCiudad.hourly.time;
	const datosPrecipitacion = datosCiudad.hourly.precipitation;
	const datosUV = datosCiudad.hourly.uv_index;
	const datosTemperatura = datosCiudad.hourly.temperature_2m;

	cargarPrecipitacion(datosTiempo, datosPrecipitacion);
	cargarUV(datosTiempo, datosUV);
	cargarTemperatura(datosTiempo, datosTemperatura);
}
