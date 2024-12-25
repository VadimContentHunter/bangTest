// websocketServer.js
const WebSocket = require("ws");
const ServerError = require("../Errors/ServerError");
const {
    JsonRpcFormatter,
    JsonRpcFormatterError,
} = require("../../../node_modules/vadimcontenthunter-jsonrpc-formatter/src/JsonRpcFormatter");
const { parseCookies, createCookie } = require("./helper"); // Импортируем функции из хелпера
const url = require("url");
const SessionHandler = require("../handlers/SessionHandler");
const JsonRpcMethodHandler = require("./JsonRpcMethodHandler");
const AuthHandler = require("../handlers/AuthHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const ServerHook = require("../hooks/ServerHook");
const { aCard, CardType } = require("../interfaces/aCard");
const StubCard = require("../models/cards/StubCard");
const Player = require("../models/Player");
const GameTableError = require("../Errors/GameTableError");
const GameTable = require("../models/GameTable");
const SelectionCardsError = require("../Errors/GameTableError");
const SelectionCards = require("../models/SelectionCards");
const GameHandlerError = require("../Errors/GameHandlerError");
const GameHandler = require("../handlers/GameHandler");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const AdminMenuError = require("../Errors/AdminMenuError");
const AdminMenuHandler = require("../handlers/AdminMenuHandler");

module.exports = function setupWebSocketServer(server, playroomHandler) {
    if (!(playroomHandler instanceof PlayroomHandler)) {
        throw new Error("playroomHandler must be an instance of PlayroomHandler");
    }

    const wss = new WebSocket.Server({ server });
    const serverHook = new ServerHook();
    const gameHandler = new GameHandler(playroomHandler);
    // const stubCard = aCard.initCard(
    //     {
    //         name: "StubCard",
    //         image: "../resources/imgs/cards/cardBacks/girl.png",
    //         type: CardType.DEFAULT,
    //         ownerName: "",
    //     },
    //     [StubCard]
    // );

    // Подписка на серверные хуки
    serverHook.on("updateUserCount", () => {
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

    serverHook.on("requestAllUser", (requestMethodName, requestData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JsonRpcFormatter.serializeRequest(requestMethodName, requestData));
            }
        });
    });

    serverHook.on("responseAllUser", (result, id = null) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JsonRpcFormatter.serializeResponse(result, id));
            }
        });
    });

    serverHook.on("Login", (ws, params, id = null) => {
        const authHandler = new AuthHandler(params?.user_name, params?.code, params?.sessionId);
        const isStatusLogin =
            authHandler.Authentication() && authHandler.Authorization(playroomHandler);
        ws.send(
            JsonRpcFormatter.serializeResponse(
                {
                    isStatusLogin: isStatusLogin,
                },
                id
            )
        );
    });

    serverHook.on("GetAdminMenu", (ws, params, id = null) => {
        const adminMenuHandler = new AdminMenuHandler(params?.sessionId);
        const htmlElement = adminMenuHandler.getAdminMenuTemplate();
        if (typeof htmlElement === "string" && htmlElement !== "") {
            ws.send(JsonRpcFormatter.serializeResponse(htmlElement, id));
        }
    });

    serverHook.on("StartGame", (ws, params, id = null) => {
        gameHandler.startGame();
    });

    gameHandler.on("playerStartedMove", ({ player }) => {
        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                player instanceof Player &&
                player.sessionId === client.sessionId
            ) {
                client.send(
                    JsonRpcFormatter.serializeRequest("lockPlayerMove", { isMyMove: true })
                );
            } else {
                client.send(
                    JsonRpcFormatter.serializeRequest("lockPlayerMove", { isMyMove: false })
                );
            }
        });
    });

    // Подписка на Игровые хуки
    gameHandler.on("afterGameStart", () => {
        gameHandler.playerActionManager.clearAll();
        gameHandler.selectCharactersForPlayers();
    });

    gameHandler.on("selectionStarted", ({ player, selectionCards }) => {
        if (player instanceof Player && selectionCards instanceof SelectionCards) {
            wss.clients.forEach((client) => {
                if (
                    client.readyState === WebSocket.OPEN &&
                    client?.sessionId === player.sessionId
                ) {
                    client.send(
                        JsonRpcFormatter.serializeRequest("selectionCardsMenu", selectionCards)
                    );
                }
            });
        }
    });

    gameHandler.on("afterSelectCharactersForPlayers", () => {
        gameHandler.executeMovesRound();
    });

    gameHandler.on("afterMovesRound", () => {
        // gameHandler.executeMovesRound();
    });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        ws.sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        // const asd = gameHandler.listenerCount('playerCardSelected') > 0;

        try {
            const player = playroomHandler.connect(ws.sessionId);
            if (player instanceof Player) {
                player.lives.max = 5;
                player.lives.current = 3;
                player.role = new StubCard(CardType.ROLE);
                // player.character = new StubCard(CardType.CHARACTER);
                player.weapon = new StubCard(CardType.WEAPON);
                player.temporaryCards.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                player.hand.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                ws.send(JsonRpcFormatter.serializeRequest("getMyPlayer", player?.getInfo()));

                serverHook.emit(
                    "requestAllUser",
                    "createAllGameBoard",
                    playroomHandler.getAllPlayersSummaryInfo()
                );

                const gameTable = new GameTable();
                gameTable.deckMain.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                gameTable.discardPile.setCards([
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                ]);
                gameTable.addPlayerCards(player, [
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                ]);
                serverHook.emit("requestAllUser", "battleZoneUpdate", gameTable);

                gameHandler.triggerHooksForPlayer(player);
            }
        } catch (error) {
            ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
            console.log(error);
        }
        serverHook.emit("updateUserCount");

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            try {
                ws.sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                ws.send(
                    JsonRpcFormatter.serializeRequest("updateSessionId", {
                        sessionId: ws.sessionId,
                        maxAge: SessionHandler.sessionLifetime * 1000,
                        path: "/",
                    })
                );

                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                requestRpc.params.sessionId = ws.sessionId;

                if (serverHook.listenerCount(requestRpc.method) !== 0) {
                    serverHook.emit(requestRpc.method, ws, requestRpc.params, requestRpc?.id);
                } else if (gameHandler.listenerCount(requestRpc.method) !== 0) {
                    gameHandler.emit(requestRpc.method, ws, requestRpc.params, requestRpc?.id);
                } else {
                    throw new Error(`No listeners found for event: ${requestRpc.method}`);
                }
            } catch (error) {
                ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
                console.log(error);
            }
        });

        // Обрабатываем отключение клиента
        ws.on("close", () => {
            try {
                // sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                playroomHandler.removePlayerOnlineBySession(ws.sessionId);
                // console.log(playroomHandler.countPlayersOnline());

                serverHook.emit("updateUserCount");
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
