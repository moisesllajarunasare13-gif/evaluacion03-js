// ui.js - Funciones que tocan el DOM (todas con export nombrado)

const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista-pedidos");
const totalTexto = document.getElementById("total");
const filtro = document.getElementById("filtro");
const inputProducto = document.getElementById("producto");
const inputPrecio = document.getElementById("precio");
const inputCantidad = document.getElementById("cantidad");

export function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.className = esError ? "error" : "ok";
}

export function leerFormulario() {
  return {
    producto: inputProducto.value.trim(),
    precioTexto: inputPrecio.value,
    cantidadTexto: inputCantidad.value
  };
}

export function limpiarFormulario() {
  inputProducto.value = "";
  inputPrecio.value = "";
  inputCantidad.value = "";
  inputProducto.focus();
}

export function render(pedidos, total) {
  lista.textContent = "";

  const visibles = pedidos.filter((p) => filtro.value === "todos" || p.estado === filtro.value);

  for (const p of visibles) {
    const { id, producto, precio, cantidad, estado } = p; // desestructuración
    const li = document.createElement("li");
    li.className = estado;

    const texto = document.createElement("span");
    texto.textContent = `${producto} - S/ ${precio.toFixed(2)} x ${cantidad} = S/ ${p.subtotal().toFixed(2)} (${estado})`;

    const botones = document.createElement("div");

    const btnEntregar = document.createElement("button");
    btnEntregar.textContent = "Entregar";
    btnEntregar.dataset.accion = "entregar";
    btnEntregar.dataset.id = id;
    btnEntregar.disabled = estado === "entregado";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.accion = "eliminar";
    btnEliminar.dataset.id = id;

    botones.append(btnEntregar, btnEliminar);
    li.append(texto, botones);
    lista.appendChild(li);
  }

  totalTexto.textContent = `Total a cobrar (con IGV): S/ ${total.toFixed(2)}`;
}
