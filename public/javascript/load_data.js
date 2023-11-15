import {
    tiempoArr, precipitacionArr, uvArr, temperaturaArr
} from './static_data.js';

import {
    ciudadesEcuador
} from './cities.js';

let fechaActual = () => new Date().toISOString().slice(0,10);

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
    if (hours < 10) hours = 0 + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    document.getElementById("HoraActual").textContent=(hours+ ":" +minutes+ ":" +seconds);
    setInterval(cargarReloj,1000)
}

let cargarNombreCiudad = (ciudad) => {document.getElementById("ciudad-header").textContent = ciudad}

let cargarDatosCiudad = (nombreCiudad) => {
    ciudadesEcuador.forEach(ciudad =>{
        if(ciudad.name == nombreCiudad)
            cargarDatos(ciudad)
    })
}

let cargarDatos = (ciudad) => {
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude='+ciudad.latitude.toString()+
            '&longitude='+ciudad.longitude.toString()+
            '&hourly=temperature_2m,precipitation,uv_index&timezone=auto'
    cargarNombreCiudad(ciudad.name)
    fetch(URL)
        .then(responseText => responseText.json())
        .then(responseJSON => {
            cargarIndicadores (responseJSON)
            cargarGraficos (responseJSON)
        })
        .catch(console.error);
    cargarPronostico (ciudad)
}

/* INDICADOR */
let cargarIndicadores = (responseJSON) => {
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
    for(let i=0;i<tiempoArr.length;i++)
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

/* GRAFICO */

let cargarGraficos = (responseJSON) => {
    let datosTiempo = responseJSON.hourly.time
    let datosPrecipitacion = responseJSON.hourly.precipitation
    let datosUV = responseJSON.hourly.uv_index
    let datosTemperatura = responseJSON.hourly.temperature_2m

    cargarGraficoPrecipitacion(datosTiempo, datosPrecipitacion)
    cargarGraficoUV(datosTiempo, datosUV)
    cargarGraficoTemperatura(datosTiempo, datosTemperatura)

    mostrarGraficoPrecipitacion()
}

let cargarGraficoPrecipitacion = (tiempo, datos) => {
    let plotRef = document.getElementById('grafico-precipitacion');

    //Objeto de configuración del gráfico
    let config = {
        type: 'line',
        data: {
            labels: tiempo, 
            datasets: [{
                label: 'Precipitación',
                data: datos,
            }]
        }
    };

    //Objeto con la instanciación del gráfico
    let chart  = new Chart(plotRef, config);
}

let cargarGraficoUV = (tiempo, datos) => {
    let plotRef = document.getElementById('grafico-uv');

    //Objeto de configuración del gráfico
    let config = {
        type: 'line',
        data: {
            labels: tiempo, 
            datasets: [{
                label: 'UV Index',
                data: datos,
                backgroundColor: 'rgba(255,200,0,1)',
            }]
        }
    };

    //Objeto con la instanciación del gráfico
    let chart  = new Chart(plotRef, config);

}
let cargarGraficoTemperatura = (tiempo, datos) => {
    let plotRef = document.getElementById('grafico-temperatura');

    //Objeto de configuración del gráfico
    let config = {
        type: 'line',
        data: {
            labels: tiempo, 
            datasets: [{
                label: 'Temperature [2m]',
                data: datos,
                backgroundColor: 'rgba(150,150,150,1)',
            }]
        }
    };

    //Objeto con la instanciación del gráfico
    let chart  = new Chart(plotRef, config);

}

let mostrarGraficoPrecipitacion = () => {
    let precipitacion = document.getElementById('grafico-precipitacion')
    let uv = document.getElementById('grafico-uv')
    let temperatura = document.getElementById('grafico-temperatura')

    mostrarGrafico(precipitacion)
    ocultarGrafico(uv)
    ocultarGrafico(temperatura)
    
}
let mostrarGraficoUV = () => {
    let precipitacion = document.getElementById('grafico-precipitacion')
    let uv = document.getElementById('grafico-uv')
    let temperatura = document.getElementById('grafico-temperatura')

    ocultarGrafico(precipitacion)
    mostrarGrafico(uv)
    ocultarGrafico(temperatura)
}
let mostrarGraficoTemperatura = () => {
    let precipitacion = document.getElementById('grafico-precipitacion')
    let uv = document.getElementById('grafico-uv')
    let temperatura = document.getElementById('grafico-temperatura')

    ocultarGrafico(precipitacion)
    ocultarGrafico(uv)
    mostrarGrafico(temperatura)
}

let mostrarGrafico = (plot) => {
    if(plot.classList.contains("d-none"))
        plot.classList.remove("d-none")
}
let ocultarGrafico = (plot) => {
    if(!plot.classList.contains("d-none"))
        plot.classList.add("d-none")
}

/* Botones */
document.getElementById("btn-precipitacion").onclick = () => {mostrarGraficoPrecipitacion();}
document.getElementById("btn-uv").onclick = () => {mostrarGraficoUV();}
document.getElementById("btn-temperatura").onclick = () => {mostrarGraficoTemperatura();}

/* PRONOSTICOS */

let cargarPronostico = async (ciudad) => {
    // Lea la entrada de almacenamiento local
    let cityStorage = localStorage.getItem(ciudad.name);

    if (cityStorage == null) {
        try {
            //API key
            let APIkey = '52ef10cd68238328de4f767883bcda7c';
            //let url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad.name}&mode=xml&appid=${APIkey}`;
            let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${ciudad.latitude}&lon=${ciudad.longitude}&mode=xml&appid=${APIkey}`;

            let response = await fetch(url)
            let responseText = await response.text()
            // Guarde la entrada de almacenamiento local
            await localStorage.setItem(ciudad.name, responseText)
            await parseXML(responseText)

        } catch (error) {
            console.log(error)
        }
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
        
        let from = time.getAttribute("from").replace("T", " ")
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
  
  //Callback
  let selectListener = async (event) => {
  
    let selectedCity = event.target.value

  }
  
  let loadForecastByCity = () => {
    //Handling event
    let selectElement = document.querySelector("select");
    selectElement.addEventListener("change", selectListener);

  }
  
  let cargarMonitoreo = async () => {
    let proxyURL = 'https://cors-anywhere.herokuapp.com/'
    let endpoint = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
    //Requerimiento asíncrono
    //let endpoint = 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/';
    let response = await fetch(endpoint);
    let responseText = await response.text();
    //LOCAL STORAGE EMILIO!!!!!!!!
    const parser = new DOMParser();
    const xml = parser.parseFromString(responseText, "text/html");

    let elementoXML = xml.querySelector("#postcontent table");
    let elementoDOM = document.getElementById("monitoreo");

    elementoDOM.innerHTML = elementoXML.outerHTML;
   }

//loadForecastByCity();

cargarFechaHora();
cargarDatosCiudad("Guayaquil");
cargarMonitoreo();