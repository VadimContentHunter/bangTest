// websocketServer.js
const WebSocket = require("ws");
const {
    JsonRpcFormatter,
    JsonRpcFormatterError,
} = require("../../../node_modules/vadimcontenthunter-jsonrpc-formatter/src/JsonRpcFormatter");
const { parseCookies, createCookie } = require("./helper"); // Импортируем функции из хелпера
const url = require("url");
const SessionHandler = require("../handlers/SessionHandler");
const JsonRpcMethodHandler = require("./JsonRpcMethodHandler");

function serverInfo(sessionId, clientIp, message) {
    console.log({
        calling: "setupWebSocketServer",
        sessionId: sessionId,
        clientIp: clientIp,
        message: message,
        timestamp: new Date().toLocaleString(),
    });
}

module.exports = function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        // Отправляем сообщение клиенту, когда он подключается
        ws.send("Добро пожаловать на сервер!");

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            const sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
            try {
                ws.send(
                    JsonRpcFormatter.serializeRequest("updateSessionId", {
                        sessionId: sessionId,
                        maxAge: SessionHandler.sessionLifetime * 1000,
                        path: "/",
                    })
                );

                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                const jsonRpcMethodHandler = new JsonRpcMethodHandler(requestRpc);
                const responseResult = jsonRpcMethodHandler.getResult();
                if (responseResult !== null) {
                    ws.send(JsonRpcFormatter.serializeResponse(responseResult, requestRpc?.id));
                }

                // const currentUserUrl = SessionHandler.getSessionData(sessionId);
            } catch (error) {
                ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
                serverInfo(
                    sessionId,
                    ip,
                    "Error Message: " + error.message + "; Code: " + error.code ?? -32000
                );
            }

            // Отправляем полученное сообщение обратно всем клиентам
            // wss.clients.forEach((client) => {
            //     if (client.readyState === WebSocket.OPEN) {
            //         client.send(`Эхо: ${message}`);
            //     }
            // });
        });

        // Обрабатываем отключение клиента
        ws.on("close", () => {
            console.log("WebSocket: Соединение закрыто");
        });
    });

    console.log("WebSocket: сервер запущен на порту 8080");
};
