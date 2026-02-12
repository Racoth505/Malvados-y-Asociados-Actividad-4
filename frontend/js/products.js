const API = "http://localhost:3000/api/productos";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    Authorization: `Bearer ${token}`
  };
}

// =================== STATE ===================
let productosGlobal = [];

// =================== DOM ===================
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");

const productoId = document.getElementById("productoId");
const nombre = document.getElementById("nombre");
const stock = document.getElementById("stock");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const fecha = document.getElementById("fecha");

const tablaProductos = document.getElementById("tablaProductos");
const searchInput = document.getElementById("searchInput");
const filterCategoria = document.getElementById("filterCategoria");

const btnAdd = document.getElementById("btnAdd");
const cancelar = document.getElementById("cancelar");
const guardar = document.getElementById("guardar");
const eliminarBtn = document.getElementById("eliminarBtn");
const logoutBtn = document.getElementById("logoutBtn");

// =================== INIT ===================
document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  if (!token) {
    window.location.href = "../login/index.html";
    return;
  }

  btnAdd.addEventListener("click", abrirNuevo);
  cancelar.addEventListener("click", cerrarModal);
  guardar.addEventListener("click", guardarProducto);
  eliminarBtn.addEventListener("click", eliminarProducto);

  searchInput.addEventListener("input", filtrar);
  filterCategoria.addEventListener("change", filtrar);

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login/index.html";
  });

  cargarProductos();
});

// Exponemos editar() porque el <tr onclick="editar(id)"> lo requiere.
window.editar = editar;

// =================== API ===================
async function cargarProductos() {
  try {
    const res = await fetch(API, { headers: authHeaders() });
    if (!res.ok) {
      const msg = await safeError(res);
      throw new Error(msg || "No se pudo cargar productos");
    }

    productosGlobal = await res.json();
    renderTabla(productosGlobal);
    cargarCategorias();
  } catch (e) {
    console.error(e);
    // Si el token expiró o es inválido, el backend responde 401
    if (String(e.message).toLowerCase().includes("token") || String(e.message).toLowerCase().includes("no autorizado")) {
      localStorage.removeItem("token");
      window.location.href = "../login/index.html";
    } else {
      alert(e.message || "Error al cargar productos");
    }
  }
}

async function safeError(res) {
  try {
    const data = await res.json();
    return data?.error;
  } catch {
    return null;
  }
}

// =================== UI ===================
function renderTabla(lista) {
  tablaProductos.innerHTML = "";

  lista.forEach(p => {
    const caducidad = p.fecha_caducidad
      ? String(p.fecha_caducidad).split("T")[0]
      : "No";

    tablaProductos.innerHTML += `
      <tr onclick="editar(${p.id})">
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.medida}</td>
        <td>${p.stock}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>${p.categoria}</td>
        <td>${caducidad}</td>
      </tr>
    `;
  });
}

function cargarCategorias() {
  filterCategoria.innerHTML = `<option value="todos">Todos</option>`;
  const categorias = [...new Set(productosGlobal.map(p => p.categoria).filter(Boolean))];

  categorias.forEach(c => {
    filterCategoria.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function filtrar() {
  const texto = (searchInput.value || "").toLowerCase().trim();
  const cat = filterCategoria.value;

  let filtrados = productosGlobal;

  if (texto) {
    filtrados = filtrados.filter(p =>
      String(p.nombre || "").toLowerCase().includes(texto)
    );
  }

  if (cat && cat !== "todos") {
    filtrados = filtrados.filter(p => p.categoria === cat);
  }

  renderTabla(filtrados);
}

function abrirNuevo() {
  modalTitle.textContent = "Nuevo Producto";
  productoId.value = "";
  eliminarBtn.classList.add("hidden");
  limpiarCampos();
  modal.classList.remove("hidden");
}

function editar(id) {
  const p = productosGlobal.find(x => Number(x.id) === Number(id));
  if (!p) return;

  modalTitle.textContent = "Editar Producto";
  eliminarBtn.classList.remove("hidden");

  productoId.value = p.id;
  nombre.value = p.nombre ?? "";
  medida.value = p.medida ?? "";
  stock.value = p.stock ?? "";
  precio.value = p.precio ?? "";
  categoria.value = p.categoria ?? "";
  fecha.value = p.fecha_caducidad ? String(p.fecha_caducidad).split("T")[0] : "";

  modal.classList.remove("hidden");
}

function cerrarModal() {
  modal.classList.add("hidden");
}

function limpiarCampos() {
  nombre.value = "";
  stock.value = "";
  precio.value = "";
  categoria.value = "";
  fecha.value = "";
}

// =================== CRUD ===================
async function guardarProducto() {
  const id = productoId.value;

  // Backend espera exactamente: nombre, medida, precio, stock, perecedero, fecha_caducidad, categoria
  const data = {
    nombre: String(nombre.value || "").trim(),
    medida: String(medida.value || "").trim(),
    stock: Number(stock.value),
    precio: Number(precio.value),
    categoria: String(categoria.value || "").trim(),
    perecedero: Boolean(fecha.value),
    fecha_caducidad: fecha.value ? fecha.value : null
  };

  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const msg = await safeError(res);
      throw new Error(msg || "Error al guardar");
    }

    cerrarModal();
    await cargarProductos();
  } catch (e) {
    console.error(e);
    alert(e.message || "Error al guardar");
  }
}

async function eliminarProducto() {
  const id = productoId.value;
  if (!id) return;
  if (!confirm("¿Eliminar producto?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    if (!res.ok) {
      const msg = await safeError(res);
      throw new Error(msg || "Error al eliminar");
    }

    cerrarModal();
    await cargarProductos();
  } catch (e) {
    console.error(e);
    alert(e.message || "Error al eliminar");
  }
}
