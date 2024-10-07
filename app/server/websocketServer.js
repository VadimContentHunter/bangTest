// websocketServer.js
const WebSocket = require("ws");

module.exports = function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  // Событие при установлении нового соединения
  wss.on("connection", (ws) => {
    console.log("Новое соединение установлено");

    // Отправляем сообщение клиенту, когда он подключается
    ws.send("Добро пожаловать на сервер!");

    // Слушаем сообщения от клиента
    ws.on("message", (message) => {
      console.log(`Получено сообщение: ${message}`);

      // Отправляем полученное сообщение обратно всем клиентам
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`Эхо: ${message}`);
        }
      });
    });

    // Обрабатываем отключение клиента
    ws.on("close", () => {
      console.log("Соединение закрыто");
    });
  });

  console.log("WebSocket сервер запущен на порту 8080");
};
