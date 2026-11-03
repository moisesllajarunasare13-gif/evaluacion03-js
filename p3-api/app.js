

const URL_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const URL_CLIMA = "https://api.open-meteo.com/v1/forecast";


const formClima = document.getElementById("form-clima");
const inputCiudad = document.getElementById("ciudad");
const btnBuscar = document.getElementById("btn-buscar");
const estado = document.getElementById("estado");
const resultado = document.getElementById("resultado");
const btnMedir = document.getElementById("btn-medir");
const tablaTiempos = document.getElementById("tabla-tiempos");
const btnFallo = document.getElementById("btn-fallo");
const salidaFallo = document.getElementById("salida-fallo");

async function buscarCiudad(nombre) {
  const url = `${URL_GEO}?name=${encodeURIComponent(nombre)}&count=1&language=es`;
  const response = await fetch(url);

 
  if (!response.ok) throw new Error(`Error ${response.status} al buscar la ciudad.`);

  const datos = await response.json();

  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No se encontró la ciudad "${nombre}".`);
  }

  const { name, admin1, country, latitude, longitude } = datos.results[0];
  return { nombre: name, region: admin1 ?? "Sin región", pais: country, lat: latitude, lon: longitude };
}

async function obtenerClima(lat, lon) {
  const url = `${URL_CLIMA}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Error ${response.status} al obtener el clima.`);

  const datos = await response.json();
  return {
    temperatura: datos.current.temperature_2m,
    viento: datos.current.wind_speed_10m,
    unidadTemp: datos.current_units.temperature_2m,
    unidadViento: datos.current_units.wind_speed_10m
  };
}

async function climaDeCiudad(nombre) {
  const ciudad = await buscarCiudad(nombre);
  const clima = await obtenerClima(ciudad.lat, ciudad.lon);
  return { ...ciudad, ...clima };
}


function mostrarEstado(texto, tipo) {
  estado.textContent = texto;
  estado.className = tipo;
}

function mensajeAmigable(error) {
  if (error instanceof TypeError) {
    return "Sin conexión: no se pudo contactar al servidor. Revisa tu internet.";
  }
  return error.message;
}

function mostrarClima(d) {
  resultado.textContent = "";
  const lineas = [
    `Ciudad: ${d.nombre}`,
    `Región: ${d.region}`,
    `Temperatura: ${d.temperatura} ${d.unidadTemp}`,
    `Viento: ${d.viento} ${d.unidadViento}`
  ];
  for (const texto of lineas) {
    const p = document.createElement("p");
    p.textContent = texto;
    resultado.appendChild(p);
  }
}


formClima.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nombre = inputCiudad.value.trim();

  if (nombre === "") {
    mostrarEstado("Escribe el nombre de una ciudad.", "error");
    return;
  }

  btnBuscar.disabled = true;
  mostrarEstado("Cargando…", "cargando");
  resultado.textContent = "";

  try {
    const datos = await climaDeCiudad(nombre);
    mostrarClima(datos);
    mostrarEstado("Listo ", "ok");
  } catch (error) {
    mostrarEstado(mensajeAmigable(error), "error");
  } finally {
    btnBuscar.disabled = false; 
  }
});

async function secuencial() {
  const lima = await climaDeCiudad("Lima");
  const cusco = await climaDeCiudad("Cusco");
  const arequipa = await climaDeCiudad("Arequipa");
  return [lima, cusco, arequipa];
}

async function paralelo() {
  return Promise.all([climaDeCiudad("Lima"), climaDeCiudad("Cusco"), climaDeCiudad("Arequipa")]);
}

async function medir(funcion) {
  const inicio = performance.now();
  await funcion();
  return performance.now() - inicio;
}

function agregarFila(valores, negrita = false) {
  const tr = document.createElement("tr");
  for (const valor of valores) {
    const td = document.createElement("td");
    td.textContent = valor;
    if (negrita) td.style.fontWeight = "bold";
    tr.appendChild(td);
  }
  tablaTiempos.appendChild(tr);
}

btnMedir.addEventListener("click", async () => {
  btnMedir.disabled = true;
  tablaTiempos.textContent = "";
  mostrarEstado("Midiendo tiempos…", "cargando");

  try {
    const seq = [];
    const par = [];
    for (let i = 1; i <= 3; i++) {
      const tSeq = await medir(secuencial);
      const tPar = await medir(paralelo);
      seq.push(tSeq);
      par.push(tPar);
      agregarFila([i, tSeq.toFixed(0), tPar.toFixed(0)]);
    }
    const promedio = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    agregarFila(["Promedio", promedio(seq).toFixed(0), promedio(par).toFixed(0)], true);
    mostrarEstado("Medición terminada ", "ok");
  } catch (error) {
    mostrarEstado(mensajeAmigable(error), "error");
  } finally {
    btnMedir.disabled = false;
  }
});

btnFallo.addEventListener("click", async () => {
  btnFallo.disabled = true;
  salidaFallo.textContent = "Cargando…";
  const ciudades = ["Lima", "Valle de Dios", "Arequipa"];
  let texto = "";

  try {
    await Promise.all(ciudades.map(climaDeCiudad));
  } catch (error) {
    texto += `Promise.all -> FALLÓ TODO: ${error.message}\n\n`;
  }

  const resultados = await Promise.allSettled(ciudades.map(climaDeCiudad));
  texto += "Promise.allSettled:\n";
  resultados.forEach((r, i) => {
    texto += r.status === "fulfilled"
      ? `  ${ciudades[i]}: ${r.value.temperatura} ${r.value.unidadTemp} ✅\n`
      : `  ${ciudades[i]}: ❌ ${r.reason.message}\n`;
  });

  salidaFallo.textContent = texto;
  btnFallo.disabled = false;
});
