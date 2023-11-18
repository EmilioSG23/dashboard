import {
    ciudadesEcuador
} from './cities.js';


/* Utilidades */
let responseJSONAsync = async (URL) => {
    let responseText;
    try{
        let response = await fetch(URL)
        responseText = await response.json()
    }catch(error){console.log(error)}
    return responseText;
}

let responseTextAsync = async (URL) => {
    let responseText;
    try{
        let response = await fetch(URL)
        responseText = await response.text()
    }catch(error){console.log(error)}
    return responseText;
}

let removeAllItemsFromLS = (name) =>{
    Object.keys(localStorage).forEach(item =>{
        if(item.startsWith(name))
            localStorage.removeItem(item)
    })
}

/* Variables globales */
let grafico_activado = "temperatura"
let provincia_activado = localStorage.getItem("provincia-activado")
let ciudad_activado = localStorage.getItem("ciudad-activado")

if(provincia_activado==null || ciudad_activado==null){
    provincia_activado= "Guayas"
    ciudad_activado= "Guayaquil"
}

/* Obtención de Objetos: Provincia y Ciudad */
let obtenerProvincia = (nombre) => {
    let provinciaObjeto
    ciudadesEcuador.forEach(provincia=>{
        if(provincia.provincia == nombre)
            provinciaObjeto = provincia
    })
    return provinciaObjeto;
}

let obtenerCiudad = (nombreProvincia, nombreCiudad) => {
    let ciudadObjeto
    let provincia = obtenerProvincia(nombreProvincia)
    provincia.ciudades.forEach(ciudad =>{
        if(ciudad.name == nombreCiudad)
            ciudadObjeto = ciudad
    })
    return ciudadObjeto
}

let obtenerCiudadActivado = () => {
    return obtenerCiudad(provincia_activado,ciudad_activado)
}

/* Obtención de Fechas y carga */
let fechaActual = () =>{
    let date = new Date();
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
} 
let horaActual = () => new Date().toString().slice(16,24);

let fechaHoraActual = () => {
    return fechaActual()+"T"+horaActual()
}
let cargarFechaHora = () => {
    cargarFechaActual()
    cargarReloj()
}
let cargarFechaActual = () => {document.getElementById("fecha-span").textContent = fechaActual();}

let cargarReloj = () =>{
    let myDate = new Date();
    let hours = myDate.getHours();
    let minutes = myDate.getMinutes();
    let seconds = myDate.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    document.getElementById("HoraActual").textContent=(hours+ ":" +minutes+ ":" +seconds);

    setInterval(cargarReloj,1000)
}

/* Carga de datos de la ciudad en el documento */
let cargarNombreCiudad = (ciudad) => {document.getElementById("ciudad-header").textContent = ciudad}

let cargarDatosCiudad = (nombreProvincia, nombreCiudad) => {
    let provincia = obtenerProvincia(nombreProvincia)
    let ciudad = obtenerCiudad(nombreProvincia, nombreCiudad)

    cargarDatos(provincia, ciudad)
    cargarNombreCiudad(ciudad.name)

    provincia_activado = nombreProvincia
    ciudad_activado = nombreCiudad
}

let cargarDatos = async (provincia, ciudad) => {
    cargarIndicadores (ciudad)
    await cargarGrafico(ciudad)
    cargarPronostico (provincia, ciudad)

    localStorage.setItem("provincia-activado", provincia.provincia)
    localStorage.setItem("ciudad-activado", ciudad.name)
}

/* Actualización de Datos Automáticos */
let actualizarDatos = () => {
    actualizarIndicadoresGraficos()
    actualizarPronostico()
    actualizarMonitoreo()

    if(localStorage.getItem("") != null)
        localStorage.removeItem("")

    setInterval(actualizarDatos,1000)
}

let actualizarIndicadoresGraficos = () =>{
    let hoy = new Date()
    let actualizarDate = new Date()
    actualizarDate.setHours(0);actualizarDate.setMinutes(0);actualizarDate.setSeconds(30);actualizarDate.setMilliseconds(0)

    if(hoy.getTime() == actualizarDate.getTime())
        location.reload()
}

let actualizarPronostico = () =>{
    let lastUpdate = new Date(localStorage.getItem("last-update-prediccion"));

    if(lastUpdate.getTime() == 0)
        return;

    let actualizarDate = new Date()
    actualizarDate.setHours((actualizarDate.getHours()-(actualizarDate .getHours()%3)));actualizarDate.setMinutes(0);actualizarDate.setSeconds(45)

    if (lastUpdate<actualizarDate){
        console.log("Se actualizó pronóstico")
        removeAllItemsFromLS("Pronostico ")
        cargarPronostico(obtenerProvincia(provincia_activado), obtenerCiudad(provincia_activado,ciudad_activado))
    }
}

let actualizarMonitoreo = () => {
    let hoy = new Date()
    let lastUpdate = new Date(localStorage.getItem("last-update-monitoreo"));

    if(lastUpdate.getTime() == 0)
        return;

    let actualizarDate = new Date()
    actualizarDate.setHours(7);actualizarDate.setMinutes(1);actualizarDate.setSeconds(0);

    if (lastUpdate<actualizarDate && hoy>actualizarDate){
        console.log("Se actualizó monitoreo")
        removeAllItemsFromLS("Monitoreo del")
        cargarMonitoreo()
    }
}

/* Carga de Indicadores de Precipitación, UV y Temperatura */
let cargarIndicadores = async (ciudad) => {
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude='+ciudad.latitude.toString()+
            '&longitude='+ciudad.longitude.toString()+
            '&hourly=temperature_2m,precipitation,uv_index'+
            '&timezone=auto'
    let responseJSON = await responseJSONAsync(URL)

    let datosTiempo = responseJSON.hourly.time
    let datosPrecipitacion = responseJSON.hourly.precipitation
    let datosUV = responseJSON.hourly.uv_index
    let datosTemperatura = responseJSON.hourly.temperature_2m

    cargarPrecipitacion(datosTiempo, datosPrecipitacion)
    cargarUV(datosTiempo, datosUV)
    cargarTemperatura(datosTiempo, datosTemperatura)
}

let calcularIndicador = (tiempo, datos) => {
    let temp = [];
    for(let i=0;i<tiempo.length;i++)
        if(tiempo[i].includes(fechaActual()))
            temp.push(datos[i]);

    let sum = temp.reduce((a, b) => a + b, 0);

    let indicador = {
        max: Math.max(...temp),
        min: Math.min(...temp),
        prom: (sum / temp.length) || 0,
    };

    return indicador
}

let cargarPrecipitacion = (tiempo, datos) => {
    let prec = calcularIndicador (tiempo, datos);

    document.getElementById("precipitacionMinValue").textContent = `Min ${prec.min} [mm]`;
    document.getElementById("precipitacionPromValue").textContent = `Prom ${Math.round(prec.prom * 100) / 100 } [mm]`;
    document.getElementById("precipitacionMaxValue").textContent = `Max ${prec.max} [mm]`;
}

let cargarUV = (tiempo, datos) => {
    let uv = calcularIndicador (tiempo, datos);

    document.getElementById("uvMinValue").textContent = `Min ${uv.min} [--]`;
    document.getElementById("uvPromValue").textContent = `Prom ${Math.round(uv.prom * 100) / 100 } [--]`;
    document.getElementById("uvMaxValue").textContent = `Max ${uv.max} [--]`;
}

let cargarTemperatura = (tiempo, datos) => {
    let temperatura = calcularIndicador(tiempo, datos)

    document.getElementById("temperaturaMinValue").textContent = `Min ${temperatura.min} [°C]`;
    document.getElementById("temperaturaPromValue").textContent = `Prom ${Math.round(temperatura.prom * 100) / 100 } [°C]`;
    document.getElementById("temperaturaMaxValue").textContent = `Max ${temperatura.max} [°C]`;
}

/* Carga de Gráficos Chart.js de una ciudad */
let cargarGrafico = (ciudad) => {
    if(grafico_activado == "precipitacion")
        cargarGraficoPrecipitacion(ciudad)
    else if (grafico_activado == "uv")
        cargarGraficoUV(ciudad)
    else if(grafico_activado == "temperatura")
        cargarGraficoTemperatura(ciudad)
    else
        cargarGraficoTemperatura(ciudad)
}

let cargarGraficoPrecipitacion = async (ciudad) => {
    if(grafico_activado == "precipitacion" && Chart.getChart("grafico") != null && ciudad.name == ciudad_activado)
        return;

    let URL = 'https://api.open-meteo.com/v1/forecast?latitude='+ciudad.latitude.toString()+
            '&longitude='+ciudad.longitude.toString()+
            '&hourly=precipitation,precipitation_probability'+'&daily=precipitation_probability_max'+'&timezone=auto'
    let responseJSON = await responseJSONAsync(URL)
    let tiempo = [responseJSON.hourly.time,responseJSON.daily.time];tiempo[1].push("")
    let datos = [responseJSON.hourly.precipitation,responseJSON.hourly.precipitation_probability,responseJSON.daily.precipitation_probability_max]

    let plotRef = document.getElementById('grafico');
    let chart = Chart.getChart("grafico")
    if(chart)
        chart.destroy()

    //Objeto de configuración del gráfico
    let config = {
        data: {
            datasets: [{
                xAxisID: 'x',
                type: 'bar',
                label: 'Precipitación',
                data: datos[0],
                backgroundColor: 'rgba(13, 110, 253,1)',
                yAxisID: 'y',
            },{
                xAxisID: 'x',
                type: 'line',
                label: 'Probabilidad de Precipitación',
                data: datos[1],
                borderColor: 'rgba(128, 180, 255,0.75)',
                backgroundColor: 'rgba(128, 180, 255,1)',
                yAxisID: 'y1',
            },{
                xAxisID: 'x1',
                type: 'line',
                label: 'Probabilidad de Precipitación Máxima',
                data: datos[2],
                borderColor: 'rgba(180, 0, 255,0.75)',
                backgroundColor: 'rgba(180, 0, 255,1)',
                yAxisID: 'y1',
            }]
        },
        options: {responsive: true,
            scales: {x: {labels: tiempo[0], display:false,},
                    x1: {labels: tiempo[1]},
                    y: {suggestedMax: 1,title: {display: true,text: 'mm'}},
                    y1: {suggestedMax:100, title: {display: true,text: '%'}}}
        }
    };

    //Objeto con la instanciación del gráfico
    chart  = new Chart(plotRef, config);
    grafico_activado = "precipitacion"
}

let cargarGraficoUV = async (ciudad) => {
    if(grafico_activado == "uv" && Chart.getChart("grafico") != null && ciudad.name == ciudad_activado)
        return;

    let URL = 'https://api.open-meteo.com/v1/forecast?latitude='+ciudad.latitude.toString()+
            '&longitude='+ciudad.longitude.toString()+
            '&hourly=uv_index,uv_index_clear_sky'+'&daily=uv_index_max,uv_index_clear_sky_max'+'&timezone=auto'
    let responseJSON = await responseJSONAsync(URL)
    let tiempo = [responseJSON.hourly.time,responseJSON.daily.time];tiempo[1].push("")
    let datos = [responseJSON.hourly.uv_index,responseJSON.hourly.uv_index_clear_sky,responseJSON.daily.uv_index_max,responseJSON.daily.uv_index_clear_sky_max]

    let plotRef = document.getElementById('grafico');

    let chart = Chart.getChart("grafico")
    if(chart)
        chart.destroy()

    //Objeto de configuración del gráfico
    let config = {
        type: 'line',
        data: {
            datasets: [{
                xAxisID: 'x',
                label: 'Índice UV',
                data: datos[0],
                borderColor: 'rgba(255,200,0,0.75)',
                backgroundColor: 'rgba(255,200,0,1)',
            },{
                xAxisID: 'x',
                label: 'Índice UV con cielo azul',
                data: datos[1],
                borderColor: 'rgba(255,135,0,0.75)',
                backgroundColor: 'rgba(255,135,0,1)',
            },{
                xAxisID: 'x1',
                label: 'Índice UV Máximo',
                data: datos[2],
                borderColor: 'rgba(180, 0, 255,0.75)',
                backgroundColor: 'rgba(180, 0, 255,1)',
            },{
                xAxisID: 'x1',
                label: 'Índice UV con cielo azul Máximo',
                data: datos[3],
                borderColor: 'rgba(0,0,0,0.75)',
                backgroundColor: 'rgba(0,0,0,1)',
            }]
        },
        options: {responsive: true,
            scales: {x: {labels: tiempo[0], display:false},
                    x1: {labels: tiempo[1]}}
        }
    };

    //Objeto con la instanciación del gráfico
    chart  = new Chart(plotRef, config);
    grafico_activado = "uv"
}
let cargarGraficoTemperatura = async (ciudad) => {
    if(grafico_activado == "temperatura" && Chart.getChart("grafico") != null && ciudad.name == ciudad_activado)
        return;
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude='+ciudad.latitude.toString()+
            '&longitude='+ciudad.longitude.toString()+
            '&hourly=temperature_2m'+'&daily=temperature_2m_max,temperature_2m_min'+'&timezone=auto'
    let responseJSON = await responseJSONAsync(URL)
    let tiempo = [responseJSON.hourly.time,responseJSON.daily.time];tiempo[1].push("")
    let datos = [responseJSON.hourly.temperature_2m,responseJSON.daily.temperature_2m_max,responseJSON.daily.temperature_2m_min]

    let plotRef = document.getElementById('grafico');

    let chart = Chart.getChart("grafico")
    if(chart)
        chart.destroy()

    //Objeto de configuración del gráfico
    let config = {
        type: 'line',
        data: {
            labels: tiempo, 
            datasets: [{
                xAxisID: 'x',
                label: 'Temperatura [2m]',
                data: datos[0],
                borderColor: 'rgba(100, 100, 100,0.75)',
                backgroundColor: 'rgba(100, 100, 100,1)',
            },{
                xAxisID: 'x1',
                label: 'Temperatura máxima [2m]',
                data: datos[1],
                borderColor: 'rgba(180, 0, 255,0.75)',
                backgroundColor: 'rgba(180, 0, 255,1)',
            },{
                xAxisID: 'x1',
                label: 'Temperatura mínima [2m]',
                data: datos[2],
                borderColor: 'rgba(0, 200, 0,0.75)',
                backgroundColor: 'rgba(0, 200, 0,1)',
            }]
        },
        options: {responsive:true,
            scales: {x: {labels: tiempo[0], display:false},
                    x1: {labels: tiempo[1]},
                    y: {title:{display:true, text: "C°"}}}
        }
    };

    //Objeto con la instanciación del gráfico
    chart  = new Chart(plotRef, config);
    grafico_activado = "temperatura"
}

/* Botones de Selección de Gráfico a mostrar en pantalla */
document.getElementById("btn-precipitacion").onclick = () => {cargarGraficoPrecipitacion(obtenerCiudadActivado());}
document.getElementById("btn-uv").onclick = () => {cargarGraficoUV(obtenerCiudadActivado());}
document.getElementById("btn-temperatura").onclick = () => {cargarGraficoTemperatura(obtenerCiudadActivado());}

/* Carga de los Pronósticos */
let cargarPronostico = async (provincia, ciudad) => {
    // Lea la entrada de almacenamiento local
    let itemName = "Pronostico "+provincia.provincia + " - " + ciudad.name
    let cityStorage = localStorage.getItem(itemName);

    if (cityStorage == null || !cityStorage.startsWith("<?xml")) {
        //API key
        let APIkey = '52ef10cd68238328de4f767883bcda7c';
        //let url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad.name}&mode=xml&appid=${APIkey}`;
        let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${ciudad.latitude}&lon=${ciudad.longitude}&mode=xml&appid=${APIkey}`;

        let responseText = await responseTextAsync(url)
        // Guarde la entrada de almacenamiento local
        await localStorage.setItem(itemName, responseText)
        await parseXML(responseText)

        await localStorage.setItem("last-update-prediccion", fechaHoraActual())
    }else{
        // Procese un valor previo
        parseXML(cityStorage)
    }
}

let parseXML = (responseText) => {
  
    // Parsing XML
    const parser = new DOMParser();
    const xml = parser.parseFromString(responseText, "application/xml");
  
    // Referencia al elemento `#forecastbody` del documento HTML
    let forecastElement = document.querySelector("#forecastbody")
    forecastElement.innerHTML = ''

    // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
    let timeArr = xml.querySelectorAll("time")

    timeArr.forEach(time => {
        
        let from = time.getAttribute("from").replace("T", " ").slice(0,16)
        let humidity = time.querySelector("humidity").getAttribute("value")
        let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
        let precipitation = time.querySelector("precipitation").getAttribute("probability")
        let pressure = time.querySelector("pressure").getAttribute("value")
        let cloud = time.querySelector("clouds").getAttribute("all")

        let template = `
            <tr>
                <td>${from}</td>
                <td>${humidity}</td>
                <td>${windSpeed}</td>
                <td>${precipitation}</td>
                <td>${pressure}</td>
                <td>${cloud}</td>
            </tr>
        `
        //Renderizando la plantilla en el elemento HTML
        forecastElement.innerHTML += template;
    })
    
  }
  
  /* Carga de Monitoreo con CORS */
  let cargarMonitoreo = async () => {
    let fechaMonitoreo = new Date(fechaActual()+"T07:00:00")
    let fecha = new Date()
    
    if(fecha < fechaMonitoreo)
        fecha.setDate(fecha.getDate()-1)
    let fechaTag = fecha.getFullYear()+"-"+(fecha.getMonth()+1)+"-"+fecha.getDate();

    let tag = "Monitoreo del "+ fechaTag
    let monitoreoStorage = localStorage.getItem(tag)

    if(monitoreoStorage == null){
        let proxyURL = 'https://cors-anywhere.herokuapp.com/'
        let endpoint = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
        //Requerimiento asíncrono
        //let endpoint = 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/';
        let response = await fetch(endpoint);
        let responseText = await response.text();

        await localStorage.setItem(tag,responseText)
        await parseMonitoreo(responseText)

        await localStorage.setItem("last-update-monitoreo", fechaHoraActual())
    }else{
        parseMonitoreo(monitoreoStorage)
    }
}

let parseMonitoreo = async (responseText) => {
    const parser = new DOMParser();
    const xml = await parser.parseFromString(responseText, "text/html");
    let elementoXML = await xml.querySelector("#postcontent table");
    let elementoDOM = document.getElementById("monitoreo-table");

    try{
        elementoDOM.innerHTML = elementoXML.outerHTML;
    }catch(error){removeAllItemsFromLS("Monitoreo del")}
}

/* Carga de Selector de Ciudad para muestra de Datos */
let cargarSelectorProvincia = () => {
    let selector_provincia = document.getElementById("selector-provincia")
    let provincias = []
    ciudadesEcuador.forEach(ciudad =>{
        provincias.push(ciudad.provincia)
    })
    selector_provincia.innerHTML = '<option selected>Seleccione provincia</option>'
    añadirItems(selector_provincia, provincias)
    selector_provincia.addEventListener("change", cargarSelectorCiudad)
}

let cargarSelectorCiudad = (event) => {
    let selector_ciudad = document.getElementById("selector-ciudad")
    let selectProvincia = event.target.value

    selector_ciudad.innerHTML = '<option selected>Seleccione ciudad</option>'
    document.getElementById("btn-mostrar-datos").disabled = true
    if(selectProvincia == "Seleccione provincia"){
        selector_ciudad.disabled = true;
        return;
    }else{
        selector_ciudad.disabled = false;
    }
    let ciudades = cargarListaCiudadesProvincia(selectProvincia)
    añadirItems(selector_ciudad,ciudades)
    selector_ciudad.addEventListener("change", mostrarDatos)
}

//Carga lista de Ciudades
let cargarListaCiudadesProvincia = (nombreProvincia) =>{
    let ciudades = []
    ciudadesEcuador.forEach(provincia =>{
        if(provincia.provincia == nombreProvincia)
            provincia.ciudades.forEach(ciudad =>{
                ciudades.push(ciudad.name)
            })
    })
    return ciudades
}

let añadirItems = (selector, lista) => {
    lista.forEach (item =>{
        selector.innerHTML += `<option>${item}</option>`
    })
}

let mostrarDatos = (event) => {
    let boton = document.getElementById("btn-mostrar-datos")

    let selectProvincia = document.getElementById("selector-provincia").value
    let selectCiudad = event.target.value

    if (selectCiudad == "Seleccione ciudad"){
        boton.disabled = true
        return;
    }else{boton.disabled = false}
    boton.onclick = () =>{cargarDatosCiudad(selectProvincia, selectCiudad)}
}

cargarFechaHora()
cargarSelectorProvincia()
cargarMonitoreo()
cargarDatosCiudad(provincia_activado, ciudad_activado)

actualizarDatos()