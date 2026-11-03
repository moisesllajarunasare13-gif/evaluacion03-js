// ==============================================
// P1 - Gestor de pedidos de CaféTec (DOM y eventos)
// ==============================================

// --- 1. Referencias al DOM ---
const form = document.getElementById("form-pedido");
const inputProducto = document.getElementById("producto");
const inputPrecio = document.getElementById("precio");
const inputCantidad = document.getElementById("cantidad");
const mensaje = document.getElementById("mensaje");
const filtro = document.getElementById("filtro");
const lista = document.getElementById("lista-pedidos");
const totalTexto = document.getElementById("total");

// --- 2. Estado: el arreglo es la "fuente de verdad" ---
let pedidos = [];
let siguienteId = 1;

// --- 3. Modelo: cada pedido es un objeto con métodos ---
function crearPedido(producto, precio, cantidad) {
  return {
    id: siguienteId++,
    producto: producto,
    precio: precio,
    cantidad: cantidad,
    estado: "pendiente",
    subtotal() {
      return this.precio * this.cantidad;
    },
    marcarEntregado() {
      this.estado = "entregado";
    }
  };
}

// --- 4. Validación: devuelve el texto del error o null si todo está bien ---
function validar(producto, precioTexto, cantidadTexto) {
  if (producto === "") return "El producto no puede estar vacío.";

  const precio = Number(precioTexto);
  if (precioTexto === "" || Number.isNaN(precio) || precio <= 0) {
    return "El precio debe ser mayor a 0.";
  }

  const cantidad = Number(cantidadTexto);
  if (cantidadTexto === "" || Number.isNaN(cantidad)) return "Ingresa una cantidad.";
  if (cantidad < 0) return "La cantidad no puede ser negativa.";
  if (!Number.isInteger(cantidad)) return "La cantidad debe ser un número entero.";

  return null;
}

function mostrarMensaje(texto, esError) {
  mensaje.textContent = texto; // textContent: nunca interpreta HTML
  mensaje.className = esError ? "error" : "ok";
}

// --- 5. render(): dibuja TODO a partir del arreglo ---
function render() {
  lista.textContent = ""; // limpia la lista

  const visibles = pedidos.filter((p) => filtro.value === "todos" || p.estado === filtro.value);

  for (const p of visibles) {
    const li = document.createElement("li");
    li.className = p.estado;

    // Texto del pedido (textContent => seguro contra XSS)
    const texto = document.createElement("span");
    texto.textContent =
      `${p.producto} - S/ ${p.precio.toFixed(2)} x ${p.cantidad} = S/ ${p.subtotal().toFixed(2)} (${p.estado})`;

    const botones = document.createElement("div");

    const btnEntregar = document.createElement("button");
    btnEntregar.textContent = "Entregar";
    btnEntregar.dataset.accion = "entregar";
    btnEntregar.dataset.id = p.id;
    btnEntregar.disabled = p.estado === "entregado";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.accion = "eliminar";
    btnEliminar.dataset.id = p.id;

    botones.append(btnEntregar, btnEliminar);
    li.append(texto, botones);
    lista.appendChild(li);
  }

  // El total se calcula con TODOS los pedidos del arreglo (no solo los filtrados)
  const total = pedidos.reduce((acumulado, p) => acumulado + p.subtotal(), 0);
  totalTexto.textContent = `Total a cobrar: S/ ${total.toFixed(2)}`;
}

// --- 6. Eventos ---

// (a) submit del formulario
form.addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita que la página se recargue

  const producto = inputProducto.value.trim();
  const error = validar(producto, inputPrecio.value, inputCantidad.value);

  if (error) {
    mostrarMensaje(error, true);
    return;
  }

  pedidos.push(crearPedido(producto, Number(inputPrecio.value), Number(inputCantidad.value)));
  form.reset();
  inputProducto.focus();
  mostrarMensaje("Pedido agregado correctamente.", false);
  render();
});

// (b) change del filtro
filtro.addEventListener("change", render);

// (c) UN SOLO listener en la lista (delegación de eventos)
lista.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-id]");
  if (!boton || !lista.contains(boton)) return; // click fuera de un botón

  const id = Number(boton.dataset.id);

  if (boton.dataset.accion === "entregar") {
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) pedido.marcarEntregado();
  } else if (boton.dataset.accion === "eliminar") {
    pedidos = pedidos.filter((p) => p.id !== id);
  }

  render();
});

// Primer dibujo (lista vacía y total en 0)
render();
