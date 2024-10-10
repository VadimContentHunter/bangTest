const express = require("express");
const path = require("path");
const setupWebSocketServer = require("./server/services/websocketServer");

const app = express();
const port = 8080;
const pathClient = path.join(__dirname, "client");
const pathClientHtml = path.join(pathClient, "html");
const pathClientCss = path.join(pathClient, "css");
const pathClientJs = path.join(pathClient, "js");
const pathClientResources = path.join(pathClient, "resources");

// Обслуживаем статические файлы из соответствующих папок
app.use("/html", express.static(pathClientHtml));             // Статические файлы из /html
app.use("/css", express.static(pathClientCss));               // Статические файлы из /css
app.use("/js", express.static(pathClientJs));                 // Статические файлы из /js
app.use("/resources", express.static(pathClientResources));   // Статические файлы из /resources

// Обрабатываем запрос на корень ("/")
app.get("/", (req, res) => {
  res.sendFile(path.join(pathClientHtml, "index.html"));
});

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(pathClientHtml, "404.html")); // Или отправьте сообщение
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Логируем стек ошибки

  const statusCode = err.statusCode || 500; // Если статус-код не определен, используем 500
  const message = err.message || "Что-то пошло не так";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Запускаем HTTP сервер с Express
const server = app.listen(port, () => {
  console.log(`HTTP сервер запущен на http://localhost:${port}`);
});

setupWebSocketServer(server);
