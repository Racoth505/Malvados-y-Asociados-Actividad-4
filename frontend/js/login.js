const API_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:3000/api";

const $ = (s) => document.querySelector(s);
const errorMsg = $("#errorMsg");

function showError(msg){
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function clearError(){
  errorMsg.hidden = true;
}

function validate(username, password){
  username = username.trim();
  if(username.length < 3) return "El usuario debe tener al menos 3 caracteres.";
  if(password.length < 4) return "La contraseña debe tener al menos 4 caracteres.";
  return null;
}

/* ================= LOGIN REAL ================= */

$("#btnLogin").addEventListener("click", async () => {
  clearError();

  const nombre = $("#username").value.trim();
  const password = $("#password").value;

  const v = validate(nombre, password);
  if(v) return showError(v);

  try {

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, password })
    });

    const data = await res.json();

    if(!res.ok){
      return showError(data.error || "Credenciales inválidas");
    }

    // Guardar token real
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", nombre);

    window.location.href = "../dashboard/index.html";

  } catch (error){
    showError("No se pudo conectar con el servidor");
  }
});

/* ================= SIGN UP REAL ================= */

$("#btnSignup").addEventListener("click", async () => {
  clearError();

  const nombre = $("#username").value.trim();
  const password = $("#password").value;

  const v = validate(nombre, password);
  if (v) return showError(v);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return showError(data.error || "Error al registrar usuario");
    }

    alert("Usuario creado correctamente ✅");

  } catch (error) {
    showError("No se pudo conectar con el servidor");
  }
});
