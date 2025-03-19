/* Obtención de Fechas y carga */
export function fechaActual() {
	const hoy = new Date();
	return hoy.toISOString().split("T")[0];
}
const horaActual = () => new Date().toString().slice(16, 24);

const cargarFechaActual = () => {
	document.getElementById("fecha-span").textContent = fechaActual();
};

const cargarReloj = () => {
	let myDate = new Date();
	let hours = myDate.getHours();
	let minutes = myDate.getMinutes();
	let seconds = myDate.getSeconds();
	if (hours < 10) hours = "0" + hours;
	if (minutes < 10) minutes = "0" + minutes;
	if (seconds < 10) seconds = "0" + seconds;
	document.getElementById("HoraActual").textContent = hours + ":" + minutes + ":" + seconds;

	setInterval(cargarReloj, 1000);
};

export const fechaHoraActual = () => {
	return fechaActual() + "T" + horaActual();
};
export const cargarFechaHora = () => {
	cargarFechaActual();
	cargarReloj();
};
