import { cargarSelectorProvincia } from "./components/city_selector.js";
import { cargarFechaHora } from "./components/dates.js";
import { actualizarDatos, cargarDatosCiudad } from "./load_data.js";
import { cargarMonitoreo } from "./sections/monitoring.js";

/* Variables globales */
export let grafico_activado = "temperatura";
export let provincia_activado = localStorage.getItem("provincia-activado") || "Guayas";
export let ciudad_activado = localStorage.getItem("ciudad-activado") || "Guayaquil";

cargarFechaHora();
cargarSelectorProvincia();
cargarMonitoreo();
cargarDatosCiudad(provincia_activado, ciudad_activado);
actualizarDatos();
