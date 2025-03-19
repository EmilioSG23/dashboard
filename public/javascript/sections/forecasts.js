import { fechaHoraActual } from "../components/dates.js";
import { obtainCityPredictions } from "../load_data.js";

/* Carga de los Pronósticos */
export async function cargarPronostico(provincia, ciudad) {
	// Lea la entrada de almacenamiento local
	let itemName = "Pronostico " + provincia.provincia + " - " + ciudad.name;
	let cityStorage = localStorage.getItem(itemName);

	if (cityStorage == null || !cityStorage.startsWith("<?xml")) {
		const response = await obtainCityPredictions(ciudad);
		// Guarde la entrada de almacenamiento local
		await localStorage.setItem(itemName, response);
		await parseXML(response);

		await localStorage.setItem("last-update-prediccion", fechaHoraActual());
	} else {
		// Procese un valor previo
		parseXML(cityStorage);
	}
}

const parseXML = (responseText) => {
	// Parsing XML
	const parser = new DOMParser();
	const xml = parser.parseFromString(responseText, "application/xml");

	// Referencia al elemento `#forecastbody` del documento HTML
	let forecastElement = document.querySelector("#forecastbody");
	forecastElement.innerHTML = "";

	// Procesamiento de los elementos con etiqueta `<time>` del objeto xml
	let timeArr = xml.querySelectorAll("time");

	timeArr.forEach((time) => {
		let from = time.getAttribute("from").replace("T", " ").slice(0, 16);
		let humidity = time.querySelector("humidity").getAttribute("value");
		let windSpeed = time.querySelector("windSpeed").getAttribute("mps");
		let precipitation = time.querySelector("precipitation").getAttribute("probability");
		let pressure = time.querySelector("pressure").getAttribute("value");
		let cloud = time.querySelector("clouds").getAttribute("all");

		let template = `
            <tr>
                <td>${from}</td>
                <td>${humidity}</td>
                <td>${windSpeed}</td>
                <td>${precipitation}</td>
                <td>${pressure}</td>
                <td>${cloud}</td>
            </tr>
        `;
		//Renderizando la plantilla en el elemento HTML
		forecastElement.innerHTML += template;
	});
};
