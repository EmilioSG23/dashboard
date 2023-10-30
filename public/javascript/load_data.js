import {
    tiempoArr, precipitacionArr, uvArr, temperaturaArr
} from './static_data.js';

let fechaActual = () => new Date().toISOString().slice(0,10);

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

  let cargarFechaActual = () => {document.getElementsByTagName("h6")[0].textContent = fechaActual();}
  
  cargarFechaActual();
  cargarPrecipitacion()