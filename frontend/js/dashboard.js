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

    const res = await fetch("http://localhost:3000/api/productos", {
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

  const hoy = new Date().toISOString().split("T")[0];

  const porCaducar = productos.filter(p => {
    if (Number(p.perecedero) !== 1) return false;
    if (!p.Fecha_caducidad) return false;

    const fecha = p.Fecha_caducidad.split("T")[0];

    const diff =
      (new Date(fecha) - new Date(hoy)) / (1000 * 60 * 60 * 24);

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
        <td>${p.Fecha_caducidad.split("T")[0]}</td>
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
    "#8fb9e3",
    "#7fbcc7",
    "#f4a261",
    "#e76f51",
    "#90be6d",
    "#c77dff"
  ];
  return colores[index % colores.length];
}
