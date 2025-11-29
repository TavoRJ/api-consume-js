// CRUD + modal + sidebar + search
const API = 'http://localhost:3000/api/productos';

// DOM
const productTableBody = document.getElementById('productTable');
const btnAdd = document.getElementById('btnAdd');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const productForm = document.getElementById('productForm');
const inputName = document.getElementById('name');
const inputPrice = document.getElementById('price');
const btnClose = document.getElementById('btnClose');
const sidebar = document.getElementById('sidebar');
const btnCollapse = document.getElementById('btnCollapse');
const overlay = document.getElementById('overlay');
const buscarInput = document.getElementById('buscarProducto');

let productosCache = [];
let editarId = null;

// UTIL: escape
function escapeHtml(str){ if (!str) return ''; return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;"); }

// MODAL
function showModal(mode='create', data={}) {
  editarId = mode === 'edit' ? data.Id : null;
  modalTitle.textContent = mode === 'edit' ? 'Editar producto' : 'Nuevo producto';
  inputName.value = data.Nombre || '';
  inputPrice.value = data.Precio != null ? Number(data.Precio).toFixed(2) : '';
  modal.classList.remove('hidden');
  overlay.classList.add('show');
  inputName.focus();
}
function hideModal(){
  modal.classList.add('hidden');
  overlay.classList.remove('show');
  productForm.reset();
  editarId = null;
}

// RENDER TABLA
function renderizarTabla(productos){
  productos = productos || [];
  productosCache = productos;
  if (!productos.length) {
    productTableBody.innerHTML = `<tr><td colspan="4" class="small">No hay productos registrados.</td></tr>`;
    return;
  }
  productTableBody.innerHTML = productos.map(p => {
    const precio = Number(p.Precio).toFixed(2);
    return `<tr data-id="${p.Id}">
      <td>${p.Id}</td>
      <td>${escapeHtml(p.Nombre)}</td>
      <td>$${precio}</td>
      <td>
        <button class="btn-primary btn-sm btn-edit" data-id="${p.Id}">Editar</button>
        <button class="btn-secondary btn-sm btn-delete" data-id="${p.Id}">Eliminar</button>
      </td>
    </tr>`;
  }).join('');
}

// FETCH CRUD
async function cargarProductos(q=''){
  try {
    const url = q ? `${API}?search=${encodeURIComponent(q)}` : API;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Error API');
    const datos = await res.json();
    renderizarTabla(datos);
  } catch(err){
    console.error(err);
    productTableBody.innerHTML = `<tr><td colspan="4" class="small">No se pudo cargar la lista. Revisa la API.</td></tr>`;
  }
}
async function crearProducto(nombre, precio){
  const res = await fetch(API, { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre, precio })});
  if(!res.ok) throw new Error('Crear failed');
  return res.json();
}
async function actualizarProducto(id, nombre, precio){
  const res = await fetch(`${API}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nombre, precio })});
  if(!res.ok) throw new Error('Actualizar failed');
  return res.json();
}
async function eliminarProducto(id){
  const res = await fetch(`${API}/${id}`, { method:'DELETE' });
  if(!res.ok) throw new Error('Eliminar failed');
  return res.json();
}

// EVENTOS
btnAdd?.addEventListener('click', ()=> showModal('create'));
btnClose?.addEventListener('click', hideModal);
overlay?.addEventListener('click', hideModal);

// submit form
productForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = inputName.value.trim();
  const precio = parseFloat(inputPrice.value);
  if (!nombre || isNaN(precio)) { alert('Nombre y precio válidos'); return; }
  try {
    if (editarId) await actualizarProducto(editarId, nombre, Number(precio.toFixed(2)));
    else await crearProducto(nombre, Number(precio.toFixed(2)));
    hideModal();
    await cargarProductos();
  } catch(err){
    console.error(err);
    alert('Error guardando producto');
  }
});

// delegación tabla (editar / eliminar)
productTableBody?.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('.btn-edit');
  const delBtn = e.target.closest('.btn-delete');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const p = productosCache.find(x => String(x.Id) === String(id));
    if (!p) { alert('No encontrado'); return; }
    showModal('edit', p);
    return;
  }
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (!confirm('Eliminar este producto?')) return;
    try { await eliminarProducto(id); await cargarProductos(); } catch(err){ console.error(err); alert('Error eliminando'); }
  }
});

// sidebar toggle (mobile)
btnCollapse?.addEventListener('click', ()=> { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
document.addEventListener('keydown', (e) => { if (e.key === 'm') sidebar.classList.toggle('open'); });

// buscar (debounce)
function debounce(fn, delay=250){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), delay);} }
buscarInput?.addEventListener('input', debounce((ev)=> { const q = ev.target.value.trim(); cargarProductos(q); }, 300));

// Inicializar
cargarProductos();
