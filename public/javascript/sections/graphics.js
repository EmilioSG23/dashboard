import { ciudad_activado, grafico_activado } from "../dashboard.js";
import { obtainCityDatas, obtenerCiudadActivado } from "../load_data.js";

/* Carga de Gráficos Chart.js de una ciudad */
let chart = Chart.getChart("grafico");
function checkAvailability(ciudad) {
	return grafico_activado == "precipitacion" && ciudad.name == ciudad_activado;
}

export function cargarGrafico(ciudad) {
	if (grafico_activado == "precipitacion") cargarGraficoPrecipitacion(ciudad);
	if (grafico_activado == "uv") cargarGraficoUV(ciudad);
	cargarGraficoTemperatura(ciudad);
}

async function cargarGraficoPrecipitacion(ciudad) {
	if (checkAvailability(ciudad) && !chart) return;

	const datosCiudad = await obtainCityDatas(ciudad);
	const tiempo = [datosCiudad.hourly.time, datosCiudad.daily.time];
	tiempo[1].push("");
	const datos = [
		datosCiudad.hourly.precipitation,
		datosCiudad.hourly.precipitation_probability,
		datosCiudad.daily.precipitation_probability_max,
	];

	const plotRef = document.getElementById("grafico");
	if (chart) chart.destroy();

	//Objeto de configuración del gráfico
	let config = {
		data: {
			datasets: [
				{
					xAxisID: "x",
					type: "bar",
					label: "Precipitación",
					data: datos[0],
					backgroundColor: "rgba(13, 110, 253,1)",
					yAxisID: "y",
				},
				{
					xAxisID: "x",
					type: "line",
					label: "Probabilidad de Precipitación",
					data: datos[1],
					borderColor: "rgba(128, 180, 255,0.75)",
					backgroundColor: "rgba(128, 180, 255,1)",
					yAxisID: "y1",
				},
				{
					xAxisID: "x1",
					type: "line",
					label: "Probabilidad de Precipitación Máxima",
					data: datos[2],
					borderColor: "rgba(180, 0, 255,0.75)",
					backgroundColor: "rgba(180, 0, 255,1)",
					yAxisID: "y1",
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				x: { labels: tiempo[0], display: false },
				x1: { labels: tiempo[1] },
				y: { suggestedMax: 1, title: { display: true, text: "mm" } },
				y1: { suggestedMax: 100, title: { display: true, text: "%" } },
			},
		},
	};

	//Objeto con la instanciación del gráfico
	chart = new Chart(plotRef, config);
	grafico_activado = "precipitacion";
}

async function cargarGraficoUV(ciudad) {
	if (checkAvailability(ciudad) && !chart) return;

	const datosCiudad = await obtainCityDatas(ciudad);
	const tiempo = [datosCiudad.hourly.time, datosCiudad.daily.time];
	tiempo[1].push("");
	const datos = [
		datosCiudad.hourly.uv_index,
		datosCiudad.hourly.uv_index_clear_sky,
		datosCiudad.daily.uv_index_max,
		datosCiudad.daily.uv_index_clear_sky_max,
	];

	const plotRef = document.getElementById("grafico");

	if (chart) chart.destroy();

	//Objeto de configuración del gráfico
	let config = {
		type: "line",
		data: {
			datasets: [
				{
					xAxisID: "x",
					label: "Índice UV",
					data: datos[0],
					borderColor: "rgba(255,200,0,0.75)",
					backgroundColor: "rgba(255,200,0,1)",
				},
				{
					xAxisID: "x",
					label: "Índice UV con cielo azul",
					data: datos[1],
					borderColor: "rgba(255,135,0,0.75)",
					backgroundColor: "rgba(255,135,0,1)",
				},
				{
					xAxisID: "x1",
					label: "Índice UV Máximo",
					data: datos[2],
					borderColor: "rgba(180, 0, 255,0.75)",
					backgroundColor: "rgba(180, 0, 255,1)",
				},
				{
					xAxisID: "x1",
					label: "Índice UV con cielo azul Máximo",
					data: datos[3],
					borderColor: "rgba(0,0,0,0.75)",
					backgroundColor: "rgba(0,0,0,1)",
				},
			],
		},
		options: { responsive: true, scales: { x: { labels: tiempo[0], display: false }, x1: { labels: tiempo[1] } } },
	};

	//Objeto con la instanciación del gráfico
	chart = new Chart(plotRef, config);
	grafico_activado = "uv";
}

async function cargarGraficoTemperatura(ciudad) {
	if (checkAvailability(ciudad) && !chart) return;

	const datosCiudad = await obtainCityDatas(ciudad);
	const tiempo = [datosCiudad.hourly.time, datosCiudad.daily.time];
	tiempo[1].push("");
	const datos = [
		datosCiudad.hourly.temperature_2m,
		datosCiudad.daily.temperature_2m_max,
		datosCiudad.daily.temperature_2m_min,
	];

	const plotRef = document.getElementById("grafico");
	if (chart) chart.destroy();

	//Objeto de configuración del gráfico
	let config = {
		type: "line",
		data: {
			labels: tiempo,
			datasets: [
				{
					xAxisID: "x",
					label: "Temperatura [2m]",
					data: datos[0],
					borderColor: "rgba(100, 100, 100,0.75)",
					backgroundColor: "rgba(100, 100, 100,1)",
				},
				{
					xAxisID: "x1",
					label: "Temperatura máxima [2m]",
					data: datos[1],
					borderColor: "rgba(180, 0, 255,0.75)",
					backgroundColor: "rgba(180, 0, 255,1)",
				},
				{
					xAxisID: "x1",
					label: "Temperatura mínima [2m]",
					data: datos[2],
					borderColor: "rgba(0, 200, 0,0.75)",
					backgroundColor: "rgba(0, 200, 0,1)",
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				x: { labels: tiempo[0], display: false },
				x1: { labels: tiempo[1] },
				y: { title: { display: true, text: "C°" } },
			},
		},
	};

	//Objeto con la instanciación del gráfico
	chart = new Chart(plotRef, config);
	grafico_activado = "temperatura";
}

/* Botones de Selección de Gráfico a mostrar en pantalla */
document.getElementById("btn-precipitacion").onclick = function () {
	cargarGraficoPrecipitacion(obtenerCiudadActivado());
};
document.getElementById("btn-uv").onclick = function () {
	cargarGraficoUV(obtenerCiudadActivado());
};
document.getElementById("btn-temperatura").onclick = function () {
	cargarGraficoTemperatura(obtenerCiudadActivado());
};
