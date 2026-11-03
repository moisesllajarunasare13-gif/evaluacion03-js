// main.js - Punto de entrada: junta pedidos.js y ui.js
import Pedido, { calcularTotal, resumen } from "./pedidos.js"; // default + nombrados
import { mostrarMensaje, leerFormulario, limpiarFormulario, render } from "./ui.js";

const form = document.getElementById("form-pedido");
const filtro = document.getElementById("filtro");
const lista = document.getElementById("lista-pedidos");

let pedidos = [];
let siguienteId = 1;

const redibujar = () => render(pedidos, calcularTotal(pedidos));

function validar({ producto, precioTexto, cantidadTexto }) {
  if (producto === "") return "El producto no puede estar vacío.";
  const precio = Number(precioTexto);
  if (precioTexto === "" || Number.isNaN(precio) || precio <= 0) return "El precio debe ser mayor a 0.";
  const cantidad = Number(cantidadTexto);
  if (cantidadTexto === "" || Number.isNaN(cantidad)) return "Ingresa una cantidad.";
  if (cantidad < 0) return "La cantidad no puede ser negativa.";
  if (!Number.isInteger(cantidad)) return "La cantidad debe ser un número entero.";
  return null;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = leerFormulario();
  const error = validar(datos);
  if (error) return mostrarMensaje(error, true);

  const nuevo = new Pedido({
    id: siguienteId++,
    producto: datos.producto,
    precio: Number(datos.precioTexto),
    cantidad: Number(datos.cantidadTexto)
  });

  pedidos = [...pedidos, nuevo]; // spread: arreglo nuevo, sin push
  limpiarFormulario();
  mostrarMensaje("Pedido agregado correctamente.");
  redibujar();
});

filtro.addEventListener("change", redibujar);

lista.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-id]");
  if (!boton || !lista.contains(boton)) return;
  const id = Number(boton.dataset.id);

  if (boton.dataset.accion === "entregar") {
    pedidos = pedidos.map((p) => (p.id === id ? p.marcarEntregado() : p)); // sin mutar
  } else if (boton.dataset.accion === "eliminar") {
    pedidos = pedidos.filter((p) => p.id !== id);
  }
  redibujar();
});

redibujar();

// ---- Demostración del arreglo de la pregunta (ver la consola F12) ----
const demo = [
  { producto: "Café", precio: 6, cantidad: 2, cliente: { nombre: "Ana" } },
  { producto: "Croissant", precio: 4.5, cantidad: 0 },
  { producto: "Jugo", precio: 8 }
];
console.log("Total correcto con IGV:", calcularTotal(demo)); // 23.6
demo.forEach((p) => console.log(resumen(p)));
