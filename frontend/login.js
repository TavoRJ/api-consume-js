// frontend/login.js
const form = document.getElementById('loginForm');
const userEl = document.getElementById('loginUser');
const passEl = document.getElementById('loginPass');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = userEl.value.trim();
  const password = passEl.value;
  if (!username || !password) return alert('Usuario y contraseña requeridos.');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Credenciales inválidas' }));
      throw new Error(err.error || 'Error al iniciar sesión');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || {}));
    // reemplaza historial para que no regrese al login con la flecha
    location.replace('index.html');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al iniciar sesión');
  }
});
