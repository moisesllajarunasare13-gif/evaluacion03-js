// Código ANTIGUO del practicante (tiene un error de lógica: "|| 1").
// Ejecutar con:  node codigo-antiguo.js
var IGV = 0.18;

function calcularTotal(pedidos) {
  var total = 0;
  for (var i = 0; i < pedidos.length; i++) {
    var cantidad = pedidos[i].cantidad || 1;   // si no hay cantidad, vale 1
    total = total + pedidos[i].precio * cantidad;
  }
  return total + total * IGV;
}

function resumen(pedido) {
  var cliente = pedido.cliente ? pedido.cliente.nombre : "Anónimo";
  return "Pedido de " + cliente + ": " + pedido.producto + " x" + pedido.cantidad;
}

var pedidos = [
  { producto: "Café", precio: 6, cantidad: 2, cliente: { nombre: "Ana" } },
  { producto: "Croissant", precio: 4.5, cantidad: 0 },   // cancelado: 0 unidades
  { producto: "Jugo", precio: 8 }                         // sin cantidad: vale 1
];

console.log("Total (código antiguo):", calcularTotal(pedidos));
pedidos.forEach(function (p) { console.log(resumen(p)); });
