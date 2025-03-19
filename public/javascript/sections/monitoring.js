import { fechaActual, fechaHoraActual } from "../components/dates.js";

/* Carga de Monitoreo con CORS */
export let cargarMonitoreo = async () => {
	let fechaMonitoreo = new Date(fechaActual() + "T07:00:00");
	let fecha = new Date();

	if (fecha < fechaMonitoreo) fecha.setDate(fecha.getDate() - 1);
	let fechaTag = fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();

	let tag = "Monitoreo del " + fechaTag;
	let monitoreoStorage = localStorage.getItem(tag);

	if (monitoreoStorage == null) {
		let proxyURL = "https://cors-anywhere.herokuapp.com/";
		let endpoint = proxyURL + "https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/";
		//Requerimiento asíncrono
		//let endpoint = 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/';
		let response = await fetch(endpoint);
		let responseText = await response.text();

		await localStorage.setItem(tag, responseText);
		await parseMonitoreo(responseText);

		await localStorage.setItem("last-update-monitoreo", fechaHoraActual());
	} else {
		parseMonitoreo(monitoreoStorage);
	}
};

let parseMonitoreo = async (responseText) => {
	const parser = new DOMParser();
	const xml = await parser.parseFromString(responseText, "text/html");
	let elementoXML = await xml.querySelector("#postcontent table");
	let elementoDOM = document.getElementById("monitoreo-table");

	try {
		elementoDOM.innerHTML = elementoXML.outerHTML;
	} catch (error) {
		removeAllItemsFromLS("Monitoreo del");
	}
};
