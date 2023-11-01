import {
    tiempoArr, precipitacionArr, uvArr, temperaturaArr
} from './static_data.js';

let fechaActual = () => new Date().toISOString().slice(0,10);

let cargarFechaActual = () => {document.getElementsByTagName("h6")[0].textContent = fechaActual();}
let cargarPrecipitacion = () => {
    //Obtenga la función fechaActual
    //Defina un arreglo temporal vacío
    //Itere en el arreglo tiempoArr para filtrar los valores de precipitacionArr que sean igual con la fecha actual
    //Con los valores filtrados, obtenga los valores máximo, promedio y mínimo
    //Obtenga la referencia a los elementos HTML con id precipitacionMinValue, precipitacionPromValue y precipitacionMaxValue
    //Actualice los elementos HTML con los valores correspondientes
    let temp = [];
    for(let i=0;i<tiempoArr.length;i++)
        if(tiempoArr[i].includes(fechaActual()))
            temp.push(precipitacionArr[i]);
    let precMax = Math.max(...temp);
    let precMin = Math.min(...temp);
    let precSum = temp.reduce((a, b) => a + b, 0);
    let precProm = (precSum / temp.length) || 0;

    document.getElementById("precipitacionMinValue").textContent = `Min ${precMin} [mm]`;
    document.getElementById("precipitacionPromValue").textContent = `Prom ${Math.round(precProm * 100) / 100 } [mm]`;
    document.getElementById("precipitacionMaxValue").textContent = `Max ${precMax} [mm]`;
}

let cargarUV = () => {
    let datos = [];
    for (let i=0; i<uvArr.length;i++)
        if (tiempoArr[i].includes(fechaActual()))
            datos.push(uvArr[i]);
    let uvMax = Math.max(...datos);
    let uvMin = Math.min(...datos);
    let uvSum = datos.reduce((a,b) => a + b, 0);
    let uvProm = (uvSum/datos.length) || 0;

    document.getElementById("uvMinValue").textContent = `Min ${uvMin} [--]`;
    document.getElementById("uvPromValue").textContent = `Prom ${Math.round(uvProm * 100) / 100 } [--]`;
    document.getElementById("uvMaxValue").textContent = `Max ${uvMax} [--]`;
}

let cargarTemperatura = () => {
    let datos = [];
    for (let i=0; i<uvArr.length;i++)
        if (tiempoArr[i].includes(fechaActual()))
            datos.push(temperaturaArr[i]);
    let temperaturaMax = Math.max(...datos);
    let temperaturaMin = Math.min(...datos);
    let temperaturaSum = datos.reduce((a,b) => a + b, 0);
    let temperaturaProm = (temperaturaSum/datos.length) || 0;

    document.getElementById("temperaturaMinValue").textContent = `Min ${temperaturaMin} [°C]`;
    document.getElementById("temperaturaPromValue").textContent = `Prom ${Math.round(temperaturaProm * 100) / 100 } [°C]`;
    document.getElementById("temperaturaMaxValue").textContent = `Max ${temperaturaMax} [°C]`;
}

let cargarOpenMeteo = () => {
    //TEMPERATURA
    //URL que responde con la respuesta a cargar
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=precipitation_probability&timezone=auto';
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        
        //Respuesta en formato JSON

        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot1');

        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;

        //Etiquetas de los datos
        let data = responseJSON.hourly.precipitation_probability;

        //Objeto de configuración del gráfico
        let config = {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                {
                    label: 'Probabilidad de Precipitación',
                    data: data, 
                }
                ]
            }
        };

        //Objeto con la instanciación del gráfico
        let chart1  = new Chart(plotRef, config);

    })
    .catch(console.error);

    //UV
    //URL que responde con la respuesta a cargar
    URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=uv_index&timezone=auto'; 
  
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        
        //Respuesta en formato JSON

        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot2');

        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;

        //Etiquetas de los datos
        let data = responseJSON.hourly.uv_index;

        //Objeto de configuración del gráfico
        let config = {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                {
                    label: 'UV Index',
                    data: data, 
                }
                ]
            }
        };

        //Objeto con la instanciación del gráfico
        let chart2  = new Chart(plotRef, config);

    })
    .catch(console.error);

    //TEMPERATURA
    //URL que responde con la respuesta a cargar
    URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto'; 
  
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        
        //Respuesta en formato JSON

        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot3');

        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;

        //Etiquetas de los datos
        let data = responseJSON.hourly.temperature_2m;

        //Objeto de configuración del gráfico
        let config = {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                {
                    label: 'Temperature [2m]',
                    data: data, 
                }
                ]
            }
        };

        //Objeto con la instanciación del gráfico
        let chart3  = new Chart(plotRef, config);

    })
    .catch(console.error);

}

  cargarOpenMeteo();

  cargarFechaActual();
  cargarPrecipitacion();
  cargarUV();
  cargarTemperatura()