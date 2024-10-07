const express = require("express");
const path = require("path");
const setupWebSocketServer = require("./app/server/websocketServer");

const app = express();
const port = 8080;
const pathClient = path.join(__dirname, "app", "client");
const pathClientHtml = path.join(pathClient, "html");
// const pathServer = path.join(__dirname, "server");

// console.log(pathApp);
// console.log(pathClient);

// Обслуживаем статический файл (главная страница)
app.use(express.static(pathClientHtml));

// Обрабатываем запрос на корень ("/")
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "index.html"));
// });

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(pathClientHtml, "404.html")); // Или отправьте сообщение
});

// Запускаем HTTP сервер с Express
const server = app.listen(port, () => {
  console.log(`HTTP сервер запущен на http://localhost:${port}`);
});

// setupWebSocketServer(server);
