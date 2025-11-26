// frontend/script.js

const API = 'http://localhost:3000/api/productos';

// UI elements (nuevo HTML)
const productTableBody = document.getElementById('productTable');
const btnAdd = document.getElementById('btnAdd');

// Modal (custom)
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const productForm = document.getElementById('productForm');
const inputName = document.getElementById('name');
const inputPrice = document.getElementById('price');
const btnClose = document.getElementById('btnClose');

if (!productTableBody) console.warn('No se encontró #productTable en el DOM');
if (!productForm) console.warn('No se encontró #productForm en el DOM');

// local cache & state
let productosCache = [];   // cache local
let editarId = null;       // si es null -> crear, si tiene id -> editar

/* ========== Helpers UI modal ========== */
function showModal(mode = 'create', data = {}) {
  editarId = mode === 'edit' ? data.Id : null;
  modalTitle.textContent = mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto';
  inputName.value = data.Nombre || '';
  // mostrar precio con 2 decimales si existe
  inputPrice.value = (data.Precio != null && data.Precio !== '') ? Number(data.Precio).toFixed(2) : '';
  modal.classList.remove('hidden');
  // focus y colocar el cursor al final
  setTimeout(() => inputName.focus(), 50);
}

function hideModal() {
  modal.classList.add('hidden');
  try { productForm.reset(); } catch(e){ /* ignore */ }
  editarId = null;
}

/* ========== Render tabla ========== */
function renderizarTabla(productos = []) {
  productosCache = productos.slice(); // clonar para editar localmente

  if (!productos || productos.length === 0) {
    productTableBody.innerHTML = `<tr><td colspan="4" class="small">No hay productos registrados.</td></tr>`;
    return;
  }

  productTableBody.innerHTML = productos.map(p => {
    const precio = (p.Precio == null || p.Precio === '') ? '0.00' : Number(p.Precio).toFixed(2);
    const fecha = p.CreadoEn ? new Date(p.CreadoEn).toLocaleString() : '';
    return `
      <tr data-id="${p.Id}">
        <td>${p.Id}</td>
        <td>${escapeHtml(p.Nombre)}</td>
        <td>$${precio}</td>
        <td>
          <button class="btn-primary btn-sm btn-edit" data-id="${p.Id}">Editar</button>
          <button class="btn-secondary btn-sm btn-delete" data-id="${p.Id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// escape básico para evitar inyección HTML en la tabla
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

/* ========== Fetch CRUD ========== */
async function cargarProductos() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Status ' + res.status);
    const datos = await res.json();
    renderizarTabla(datos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    productTableBody.innerHTML = `<tr><td colspan="4" class="small">No se pudo cargar la lista. Revisa la API.</td></tr>`;
  }
}

async function crearProducto(nombre, precio) {
  // enviar precio con 2 decimales como número
  const payload = { nombre, precio: Number(Number(precio).toFixed(2)) };
  const res = await fetch(API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Error' }));
    throw new Error(err.error || 'Error al crear');
  }
  return await res.json();
}

async function actualizarProducto(id, nombre, precio) {
  const payload = { nombre, precio: Number(Number(precio).toFixed(2)) };
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Error' }));
    throw new Error(err.error || 'Error al actualizar');
  }
  return await res.json();
}

async function eliminarProducto(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Error' }));
    throw new Error(err.error || 'Error al eliminar');
  }
  return await res.json();
}

/* ========== Event handlers ========== */

// Abrir modal para crear
if (btnAdd) {
  btnAdd.addEventListener('click', () => showModal('create'));
}

// Cerrar modal (botón cancelar)
if (btnClose) {
  btnClose.addEventListener('click', hideModal);
}

// Submit modal (crear o editar)
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = inputName.value.trim();
    // Aceptar decimales; reemplazar coma por punto en caso de que el usuario use coma
    const precioRaw = String(inputPrice.value).replace(',', '.').trim();
    const precio = parseFloat(precioRaw);

    if (!nombre || isNaN(precio)) {
      alert('Debe ingresar nombre y precio válidos (ej: 2.99).');
      return;
    }

    try {
      if (editarId) {
        await actualizarProducto(editarId, nombre, precio);
      } else {
        await crearProducto(nombre, precio);
      }
      hideModal();
      await cargarProductos();
    } catch (err) {
      console.error('Guardar producto error:', err);
      alert('Error: ' + (err.message || 'No se pudo guardar'));
    }
  });
} else {
  console.warn('productForm no encontrado. Verifica tu HTML.');
}

// Delegación para botones editar/eliminar en la tabla
if (productTableBody) {
  productTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const producto = productosCache.find(p => String(p.Id) === String(id));
      if (!producto) { alert('Producto no encontrado'); return; }
      showModal('edit', producto);
      return;
    }

    if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      if (!confirm('¿Eliminar este producto?')) return;
      try {
        await eliminarProducto(id);
        await cargarProductos();
      } catch (err) {
        console.error('Eliminar producto error:', err);
        alert('No se pudo eliminar el producto.');
      }
    }
  });
}

/* Cerrar modal con Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) hideModal();
});

/* ejecutar */
cargarProductos();
