const API = "https://memotoriapi.onrender.com";

document.addEventListener("DOMContentLoaded", () => {

  const btnLogin = document.getElementById("btnLogin");
  const inputEmail = document.getElementById("login-email");
  const inputPassword = document.getElementById("login-password");
  const loginMsg = document.getElementById("login-msg");

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    loginMsg.textContent = "";

    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    if (!email || !password) {
      loginMsg.textContent = "Completa todos los campos";
      return;
    }

    try {
      const res = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data.detail === "string") {
          loginMsg.textContent = data.detail;
        } else if (Array.isArray(data.detail)) {
          loginMsg.textContent = data.detail[0].msg;
        } else {
          loginMsg.textContent = "Error al iniciar sesión";
        }
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      loginMsg.textContent = "Login exitoso ✅";
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error(error);
      loginMsg.textContent = "Error de conexión con el servidor";
    }
  });


  const registerForm = document.getElementById("register-form");
  const registerEmail = document.getElementById("register-email");
  const registerPassword = document.getElementById("register-password");
  const registerMsg = document.getElementById("register-msg");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerMsg.textContent = "";

    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();

    if (!email || !password) {
      registerMsg.textContent = "Completa todos los campos";
      return;
    }

    try {
      const res = await fetch(`${API}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data.detail === "string") {
          registerMsg.textContent = data.detail;
        } else if (Array.isArray(data.detail)) {
          registerMsg.textContent = data.detail[0].msg;
        } else {
          registerMsg.textContent = "Error al registrar";
        }
        return;
      }

      registerMsg.textContent = "Cuenta creada correctamente ✅";

      document.getElementById("btn-iniciar").click();

    } catch (error) {
      console.error(error);
      registerMsg.textContent = "Error de conexión con el servidor";
    }
  });

});
