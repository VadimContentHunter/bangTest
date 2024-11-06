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
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const EventEmitter = require("events");
class MyHookEmitter extends EventEmitter {}
const myHooks = new MyHookEmitter();

module.exports = function setupWebSocketServer(server, playroomHandler) {
    if (!(playroomHandler instanceof PlayroomHandler)) {
        throw new Error("playroomHandler must be an instance of PlayroomHandler");
    }

    const wss = new WebSocket.Server({ server });

    // Подписка на хуки
    myHooks.on("updateUserCount", () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JsonRpcFormatter.serializeRequest("updateUserCount", {
                        quantity: playroomHandler.countPlayersOnline(),
                    })
                );
            }
        });
    });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        let sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        playroomHandler.connect(sessionId);
        myHooks.emit("updateUserCount");

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            // sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
            try {
                // ws.send(
                //     JsonRpcFormatter.serializeRequest("updateSessionId", {
                //         sessionId: sessionId,
                //         maxAge: SessionHandler.sessionLifetime * 1000,
                //         path: "/",
                //     })
                // );

                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                requestRpc.params.sessionId = sessionId;

                const jsonRpcMethodHandler = new JsonRpcMethodHandler(requestRpc);
                if (
                    jsonRpcMethodHandler.instance instanceof aResponseHandler &&
                    typeof requestRpc.id === "number"
                ) {
                    const result = jsonRpcMethodHandler.instance.getResult();
                    if (result !== null) {
                        ws.send(JsonRpcFormatter.serializeResponse(result, requestRpc?.id));
                    }
                }

                // const currentUserUrl = SessionHandler.getSessionData(sessionId);
                // if (currentUserUrl === "/playroom") {
                //     jsonRpcMethodHandler.setAdditionalParams(playroomHandler);
                // }
            } catch (error) {
                ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
                console.log(error);

                // serverInfo(
                //     sessionId,
                //     ip,
                //     "Error Message: " + error.message + "; Code: " + error.code ?? -32000
                // );
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
            try {
                // sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                playroomHandler.removePlayerOnlineBySession(sessionId);
                // console.log(playroomHandler.countPlayersOnline());

                myHooks.emit("updateUserCount");
            } catch (error) {
                if (error instanceof PlayroomHandlerError) {
                    console.log(error.message);
                }
            }

            console.log("WebSocket: Соединение закрыто");
        });
    });

    console.log("WebSocket: сервер запущен на порту 8080");
};
