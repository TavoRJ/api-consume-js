// frontend/script.js
const API = 'http://localhost:3000/api/productos';
const listaEl = document.getElementById('lista');
const form = document.getElementById('formProducto');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const mensajeVacio = document.getElementById('mensajeVacio');
const statusEl = document.getElementById('status');
const btnAgregar = document.getElementById('btnAgregar');
// referencias modal
const modalEditarEl = document.getElementById('modalEditar');
const formEditar = document.getElementById('formEditar');
const editarIdEl = document.getElementById('editarId');
const editarNombreEl = document.getElementById('editarNombre');
const editarPrecioEl = document.getElementById('editarPrecio');
const editarErrorEl = document.getElementById('editarError');

// crear instancia de Bootstrap modal (para control por JS)
let bootstrapModal;
if (typeof bootstrap !== 'undefined') {
  bootstrapModal = new bootstrap.Modal(document.getElementById('modalEditar'));
}


async function cargarProductos() {
  try {
    statusEl.textContent = 'Cargando...';
    const res = await fetch(API);
    if (!res.ok) throw new Error('Error al obtener productos: ' + res.status);
    const datos = await res.json();
    statusEl.textContent = '';
    renderizar(datos);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error al cargar';
    listaEl.innerHTML = '';
    mensajeVacio.classList.remove('d-none');
    mensajeVacio.textContent = 'Imposible cargar productos. Revisa la API.';
  }
}

function renderizar(productos) {
  if (!productos || productos.length === 0) {
    listaEl.innerHTML = '';
    mensajeVacio.classList.remove('d-none');
    return;
  }
  mensajeVacio.classList.add('d-none');

  listaEl.innerHTML = productos.map(p => {
    const fecha = p.CreadoEn ? new Date(p.CreadoEn).toLocaleString() : '';
    return `
  <div class="col-md-4">
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mb-1">${escapeHtml(p.Nombre)}</h5>
        <p class="card-text mb-1"><strong>$${Number(p.Precio).toFixed(2)}</strong></p>
        <small class="text-muted mb-2">${fecha}</small>
        <div class="mt-auto d-flex gap-2">
        <button class="btn btn-sm btn-primary btn-editar"
        data-id="${p.Id}"
        data-nombre="${escapeHtml(p.Nombre)}"
        data-precio="${p.Precio}">
    Editar
</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${p.Id}">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
`;
  }).join('');
}

// simple escape to avoid HTML injection
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const precio = parseFloat(inputPrecio.value);
  if (!nombre || isNaN(precio)) {
    alert('Completa nombre y precio válidos.');
    return;
  }

  // UI feedback
  btnAgregar.disabled = true;
  btnAgregar.textContent = 'Agregando...';

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nombre, precio })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Error' }));
      throw new Error(err.error || 'Error al crear');
    }

    // limpiar formulario y recargar
    inputNombre.value = '';
    inputPrecio.value = '';
    await cargarProductos();
  } catch (err) {
    console.error(err);
    alert('No se pudo agregar el producto: ' + err.message);
  } finally {
    btnAgregar.disabled = false;
    btnAgregar.textContent = 'Agregar';
  }
});

// delegación de eventos para botones eliminar
document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-eliminar')) {
    const id = e.target.getAttribute('data-id');
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'Error'}));
        throw new Error(err.error || res.status);
      }
      await cargarProductos();
    } catch (err) {
      console.error('Eliminar error', err);
      alert('No se pudo eliminar');
    }
  }
});

// editar producto (opcional)
// Delegación de eventos: abrir modal al hacer click en Editar
document.addEventListener('click', (e) => {
  // abrir modal
  if (e.target.matches('.btn-editar')) {
    const id = e.target.getAttribute('data-id');
    const nombre = e.target.getAttribute('data-nombre');
    const precio = e.target.getAttribute('data-precio');

    // llenar formulario del modal
    editarIdEl.value = id;
    editarNombreEl.value = nombre;
    editarPrecioEl.value = precio;

    // limpiar errores
    editarErrorEl.classList.add('d-none');
    editarErrorEl.textContent = '';

    // mostrar modal usando Bootstrap JS (si está disponible)
    if (bootstrapModal) {
      bootstrapModal.show();
    } else {
      // fallback: focus al input si modal no disponible
      editarNombreEl.focus();
    }
  }
});

// manejar submit del modal (PUT)
formEditar.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  const id = editarIdEl.value;
  const nombre = editarNombreEl.value.trim();
  const precio = parseFloat(editarPrecioEl.value);

  // validación sencilla
  if (!nombre || isNaN(precio) || precio < 0) {
    editarErrorEl.classList.remove('d-none');
    editarErrorEl.textContent = 'Nombre y precio válidos son requeridos.';
    return;
  }

  // feedback UI
  const btnGuardar = document.getElementById('btnGuardarCambios');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio: parseFloat(precio) })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({error:'Error'}));
      throw new Error(err.error || 'Error al actualizar');
    }

    // cerrar modal y recargar productos
    if (bootstrapModal) bootstrapModal.hide();
    await cargarProductos();

  } catch (err) {
    console.error('Error al guardar cambios:', err);
    editarErrorEl.classList.remove('d-none');
    editarErrorEl.textContent = 'No se pudo guardar. Revisa la consola.';
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar cambios';
  }
});


// cargar al inicio
cargarProductos();
