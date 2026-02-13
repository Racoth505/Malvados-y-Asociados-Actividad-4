const API_BASE = window.APP_CONFIG?.API_BASE_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../login/index.html";
    return;
  }

  const nombreUsuario = localStorage.getItem("user");
  document.getElementById("userName").textContent = nombreUsuario;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login/index.html";
  });

  loadDashboard();
});


async function loadDashboard() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/productos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("No autorizado");

    const productos = await res.json();

    renderResumen(productos);
    renderCaducados(productos);
    renderBajoStock(productos);
    renderCategoriasCantidad(productos);
    renderCategoriasValor(productos);

  } catch (error) {
    console.error("Error:", error);
    window.location.href = "../login/index.html";
  }
}

/* ================= RESUMEN ================= */

function renderResumen(productos) {
  const totalProductos = productos.length;

  const valorTotal = productos.reduce((acc, p) => {
    return acc + (Number(p.precio) * Number(p.stock));
  }, 0);

  document.getElementById("totalProductos").textContent = totalProductos;
  document.getElementById("valorTotal").textContent =
    "$" + valorTotal.toLocaleString();
}

/* ================= BAJO STOCK ================= */

function renderBajoStock(productos) {
  const bajoStock = productos.filter(p => Number(p.stock) <= 10);

  const table = document.getElementById("tablaBajoStock");

  table.innerHTML = `
    <tr>
      <th>Producto</th>
      <th>Stock</th>
    </tr>
  `;

  bajoStock.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.stock}</td>
      </tr>
    `;
  });
}

/* ================= POR CADUCAR ================= */

function renderCaducados(productos) {

  // Normalizamos "hoy" a inicio del día para evitar problemas de zona horaria.
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const porCaducar = productos.filter(p => {
    // En la API el campo viene como `fecha_caducidad` (alias en el SELECT)
    // y `perecedero` puede venir como 0/1 o boolean.
    const esPerecedero =
      p.perecedero === true || Number(p.perecedero) === 1;

    const fechaCad = p.fecha_caducidad;
    if (!esPerecedero || !fechaCad) return false;

    const fechaStr = String(fechaCad).split("T")[0];
    const fecha = new Date(`${fechaStr}T00:00:00`);
    fecha.setHours(0, 0, 0, 0);

    const diff = (fecha - hoy) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  });

  const table = document.getElementById("tablaCaducados");

  table.innerHTML = `
    <tr>
      <th>Producto</th>
      <th>Fecha de Caducación</th>
    </tr>
  `;

  if (porCaducar.length === 0) {
    table.innerHTML += `
      <tr>
        <td colspan="2">No hay productos próximos a caducar</td>
      </tr>
    `;
    return;
  }

  porCaducar.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${String(p.fecha_caducidad).split("T")[0]}</td>
      </tr>
    `;
  });
}




/* ================= CATEGORIA POR CANTIDAD ================= */

function renderCategoriasCantidad(productos) {
  const categorias = {};

  productos.forEach(p => {
    const categoria =
      p.Categoria ??
      p.categoria ??
      "Sin categoría";

    categorias[categoria] = (categorias[categoria] || 0) + 1;
  });

  const total = productos.length;
  const container = document.getElementById("categoriaCantidad");
  const grafica = document.getElementById("graficaCantidad");

  container.innerHTML = "";

  let acumulado = 0;
  let gradiente = "conic-gradient(";

  Object.entries(categorias).forEach(([nombre, cantidad], index, arr) => {
    const porcentaje = (cantidad / total) * 100;
    const color = getColor(index);

    container.innerHTML += `<p>${nombre}: ${porcentaje.toFixed(0)}%</p>`;

    gradiente += `${color} ${acumulado}% ${acumulado + porcentaje}%`;
    acumulado += porcentaje;

    if (index < arr.length - 1) gradiente += ", ";
  });

  gradiente += ")";
  grafica.style.background = gradiente;
}


/* ================= CATEGORIA POR VALOR ================= */

function renderCategoriasValor(productos) {
  const categorias = {};

  productos.forEach(p => {
    const categoria =
      p.Categoria ??
      p.categoria ??
      "Sin categoría";

    const precio = Number(p.Precio ?? p.precio ?? 0);
    const stock = Number(p.stock ?? 0);

    const valor = precio * stock;

    categorias[categoria] =
      (categorias[categoria] || 0) + valor;
  });

  const totalValor = Object.values(categorias)
    .reduce((a, b) => a + b, 0);

  const container = document.getElementById("categoriaValor");
  const grafica = document.getElementById("graficaValor");

  container.innerHTML = "";

  let acumulado = 0;
  let gradiente = "conic-gradient(";

  Object.entries(categorias).forEach(([nombre, valor], index, arr) => {
    const porcentaje =
      totalValor === 0 ? 0 : (valor / totalValor) * 100;

    const color = getColor(index);

    container.innerHTML += `<p>${nombre}: ${porcentaje.toFixed(0)}%</p>`;

    gradiente += `${color} ${acumulado}% ${acumulado + porcentaje}%`;
    acumulado += porcentaje;

    if (index < arr.length - 1) gradiente += ", ";
  });

  gradiente += ")";
  grafica.style.background = gradiente;
}


function getColor(index) {
  const colores = [
    "#00A6FB", // Azul electrico
    "#FF2D55", // Fucsia rojo
    "#39D353", // Verde neon
    "#FFD60A", // Amarillo vivo
    "#8B5CF6", // Violeta brillante
    "#00E5A8", // Turquesa neon
    "#FF6A00", // Naranja intenso
    "#FF4FD8"  // Magenta vivo
  ];
  return colores[index % colores.length];
}
