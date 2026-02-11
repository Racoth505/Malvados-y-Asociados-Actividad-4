const API = "http://localhost:3000/api/productos";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login/index.html";
}

let productosGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  btnAdd.onclick = abrirNuevo;
  cancelar.onclick = cerrarModal;
  guardar.onclick = guardarProducto;
  eliminar.onclick = eliminarProducto;

  searchInput.oninput = filtrar;
  filterCategoria.onchange = filtrar;

  logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "../login/index.html";
  };
});

async function cargarProductos() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  productosGlobal = await res.json();

  renderTabla(productosGlobal);
  cargarCategorias();
}

function renderTabla(lista) {
  tablaProductos.innerHTML = "";

  lista.forEach(p => {

    const caducidad = p.fecha_caducidad
      ? p.fecha_caducidad.split("T")[0]
      : "No";

    tablaProductos.innerHTML += `
      <tr onclick="editar(${p.id})">
        <td>${p.id}</td>
        <td>${p.nombre}</td>
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

  const categorias = [...new Set(productosGlobal.map(p => p.categoria))];

  categorias.forEach(c => {
    filterCategoria.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function filtrar() {
  const texto = searchInput.value.toLowerCase();
  const categoria = filterCategoria.value;

  let filtrados = productosGlobal.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  if (categoria !== "todos") {
    filtrados = filtrados.filter(p => p.categoria === categoria);
  }

  renderTabla(filtrados);
}

function abrirNuevo() {
  modalTitle.textContent = "Nuevo Producto";
  productoId.value = "";
  eliminar.classList.add("hidden");
  limpiarCampos();
  modal.classList.remove("hidden");
}

function editar(id) {
  const p = productosGlobal.find(x => x.id === id);

  modalTitle.textContent = "Editar Producto";
  eliminar.classList.remove("hidden");

  productoId.value = p.id;
  nombre.value = p.nombre;
  stock.value = p.stock;
  precio.value = p.precio;
  categoria.value = p.categoria;
  fecha.value = p.fecha_caducidad
    ? p.fecha_caducidad.split("T")[0]
    : "";

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

async function guardarProducto() {

  const id = productoId.value;

  const data = {
    nombre: nombre.value,
    medida: "Unidad",
    stock: Number(stock.value),
    precio: Number(precio.value),
    Categoria: categoria.value, // 👈 IMPORTANTE mayúscula
    perecedero: fecha.value ? true : false,
    Fecha_caducidad: fecha.value || null
  };

  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  const res = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.error("Error al guardar");
    return;
  }

  cerrarModal();
  cargarProductos();
}


async function eliminarProducto() {
  if (!confirm("¿Eliminar producto?")) return;

  await fetch(`${API}/${productoId.value}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  cerrarModal();
  cargarProductos();
}
