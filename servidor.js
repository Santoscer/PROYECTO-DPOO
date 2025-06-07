const http = require("http");
const fs = require("fs");
const path = require("path");

const PUERTO = 3000;
const CARPETA_PUBLIC = path.join(__dirname, "Pagina");
const RUTA_JSON = path.join(__dirname, "usuarios.json");
const RUTA_TXT = path.join(__dirname, "usuarios.txt");
const RUTA_HUMEDAD = path.join(__dirname, "humedad.json");

class Usuario {
  constructor(nombre, email, telefono, password) {
    this.id = Date.now();
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.password = password;
    this.fecha = new Date().toLocaleString();
  }

  validar() {
    return (
      this.nombre &&
      this.email.includes("@") &&
      this.password.length >= 6 &&
      this.telefono.length >= 10
    );
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      password: this.password,
      fecha: this.fecha
    };
  }

  toTextoPlano() {
    return `\n - ID: ${this.id}\n - Nombre: ${this.nombre}\n - Email: ${this.email}\n - Telefono: ${this.telefono}\n - Fecha: ${this.fecha}\n`;
  }
}

function servirArchivo(res, filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404 - No encontrado");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("500 - Error interno");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  // Registrar usuario
  if (url === "/api/registro" && method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const datos = JSON.parse(body);
        const nuevo = new Usuario(datos.nombre, datos.email, datos.telefono, datos.password);

        if (!nuevo.validar()) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Datos inválidos.");
        }

        let lista = [];
        if (fs.existsSync(RUTA_JSON)) {
          lista = JSON.parse(fs.readFileSync(RUTA_JSON, "utf8")) || [];
        }

        if (lista.find(u => u.email === nuevo.email)) {
          res.writeHead(409, { "Content-Type": "text/plain" });
          return res.end("Email ya registrado.");
        }

        lista.push(nuevo.toJSON());
        fs.writeFileSync(RUTA_JSON, JSON.stringify(lista, null, 2));
        fs.appendFileSync(RUTA_TXT, nuevo.toTextoPlano());

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Usuario registrado correctamente.");
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("JSON inválido.");
      }
    });
    return;
  }

  // Obtener usuarios
  if (url === "/api/usuarios" && method === "GET") {
    let lista = [];

    if (fs.existsSync(RUTA_JSON)) {
      lista = JSON.parse(fs.readFileSync(RUTA_JSON, "utf8")) || [];
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(lista));
  }

  // Guardar humedad (modificado para validar y parsear valor)
  if (url === "/guardar-humedad" && method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { userId, valor } = JSON.parse(body);
        const humedadValor = parseFloat(valor);

        if (isNaN(humedadValor)) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Valor de humedad inválido.");
        }

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString();
        const hora = ahora.toLocaleTimeString();

        let registros = [];
        if (fs.existsSync(RUTA_HUMEDAD)) {
          registros = JSON.parse(fs.readFileSync(RUTA_HUMEDAD));
        }

        registros.push({ userId, valor: humedadValor, fecha, hora });
        fs.writeFileSync(RUTA_HUMEDAD, JSON.stringify(registros, null, 2));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ mensaje: "Guardado correctamente" }));
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Error al procesar la humedad.");
      }
    });
    return;
  }

  // Obtener historial
  if (url.startsWith("/obtener-historial") && method === "GET") {
    const partes = url.split("/");
    const id = partes[2];

    if (fs.existsSync(RUTA_HUMEDAD)) {
      const registros = JSON.parse(fs.readFileSync(RUTA_HUMEDAD));
      const datos = registros.filter(r => r.userId === id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(datos));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([]));
    }
    return;
  }
  
  let rutaRel = req.url === "/" ? "registro.html" : req.url.slice(1).split("?")[0];
  const ext = path.extname(rutaRel).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const filePath = path.join(CARPETA_PUBLIC, rutaRel);
  servirArchivo(res, filePath, contentType);
});

server.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
