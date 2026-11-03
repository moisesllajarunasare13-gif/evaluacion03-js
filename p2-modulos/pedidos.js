// pedidos.js - Clase Pedido y cálculos (sin tocar el DOM)

// Export NOMBRADO: una constante suelta
export const IGV = 0.18;

// Export DEFAULT: es "lo principal" de este archivo
export default class Pedido {
  // Desestructuración con valores por defecto
  constructor({ id, producto, precio, cantidad = 1, estado = "pendiente", cliente } = {}) {
    this.id = id;
    this.producto = producto;
    this.precio = precio;
    this.cantidad = cantidad;
    this.estado = estado;
    this.cliente = cliente;
  }

  subtotal() {
    return this.precio * this.cantidad;
  }

  // NO muta: devuelve un pedido NUEVO copiado con spread
  marcarEntregado() {
    return new Pedido({ ...this, estado: "entregado" });
  }
}

// Export NOMBRADO: funciones de cálculo
export const calcularTotal = (pedidos = []) => {
  // ?? solo usa 1 si cantidad es null/undefined (el 0 se respeta)
  const subtotal = pedidos.reduce(
    (acumulado, { precio, cantidad }) => acumulado + precio * (cantidad ?? 1),
    0
  );
  const totalConIgv = subtotal * (1 + IGV);
  return Math.round(totalConIgv * 100) / 100; // 2 decimales
};

export const resumen = ({ producto, cantidad = 1, cliente } = {}) =>
  `Pedido de ${cliente?.nombre ?? "Anónimo"}: ${producto} x${cantidad}`;
