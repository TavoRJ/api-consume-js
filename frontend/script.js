// frontend/script.js
const API = 'http://localhost:3000/api/productos';
const listaEl = document.getElementById('lista');
const form = document.getElementById('formProducto');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const mensajeVacio = document.getElementById('mensajeVacio');
const statusEl = document.getElementById('status');
const btnAgregar = document.getElementById('btnAgregar');

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
// delegación de eventos para btn-editar (PUT)
document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-editar')) {
    const id = e.target.getAttribute('data-id');
    const nombreActual = e.target.getAttribute('data-nombre');
    const precioActual = e.target.getAttribute('data-precio');

    // prompts rápidos
    const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
    if (!nuevoNombre) return;

    const nuevoPrecio = prompt("Nuevo precio:", precioActual);
    if (!nuevoPrecio || isNaN(nuevoPrecio)) {
      alert("Precio inválido.");
      return;
    }

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre,
          precio: parseFloat(nuevoPrecio)
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>({error:"Error desconocido"}));
        throw new Error(err.error || res.status);
      }

      await cargarProductos(); // refresca UI
    } catch (err) {
      console.error("Editar error", err);
      alert("No se pudo editar el producto.");
    }
  }
});


// cargar al inicio
cargarProductos();
