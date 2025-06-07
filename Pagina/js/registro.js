document.getElementById("formularioRegistro").addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const password = document.getElementById("password").value;

  fetch("/api/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, telefono, password })
  })
  .then(res => res.text())
  .then(mensaje => {
    document.getElementById("resultado").innerText = mensaje;

    if (mensaje === "Usuario registrado correctamente.") {
      fetch("/api/usuarios")
        .then(res => res.json())
        .then(usuarios => {
          const usuario = usuarios.find(u => u.email === email);
          if (usuario) {
            localStorage.setItem("id", usuario.id);
            window.location.href = "login.html";
          }
        });
    }
  })
  .catch(err => {
    document.getElementById("resultado").innerText = "Error al registrar.";
  });
});
