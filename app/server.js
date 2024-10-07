const express = require("express");
const path = require("path");
const setupWebSocketServer = require("./server/websocketServer");

const app = express();
const port = 8080;
const pathClient = path.join(__dirname, "client");
const pathClientHtml = path.join(pathClient, "html");
// const pathServer = path.join(__dirname, "server");

// console.log(pathApp);
// console.log(pathClient);

// Обслуживаем статический файл (главная страница)
app.use(express.static(pathClientHtml));

// Обрабатываем запрос на корень ("/")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
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

// setupWebSocketServer(server);
