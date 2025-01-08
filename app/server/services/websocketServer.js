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
const PlayerCollection = require("../handlers/PlayerCollection");

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

    serverHook.on("updateFullDataClients", (playerCollection, gameTable) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                if (playerCollection instanceof PlayerCollection) {
                    client.send(
                        JsonRpcFormatter.serializeRequest(
                            "getMyPlayer",
                            playerCollection.getPlayerBySessionId(client.sessionId).getInfo()
                        )
                    );
                    client.send(
                        JsonRpcFormatter.serializeRequest(
                            "createAllGameBoard",
                            playerCollection.getDataSummaryAllPlayers()
                        )
                    );
                }

                if (gameTable instanceof GameTable) {
                    client.send(JsonRpcFormatter.serializeRequest("battleZoneUpdate", gameTable));
                }
            }
        });
    });

    serverHook.on("lockPlayerMove", (player) => {
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

    gameHandler.on("playerStartedMove", ({ player, playerCollection, gameTable }) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
        serverHook.emit("lockPlayerMove", player);
    });

    // Подписка на Игровые хуки
    gameHandler.on("afterGameStart", () => {
        gameHandler.playerActionManager.clearAll();
        gameHandler.selectRolesForPlayers();
    });

    gameHandler.on("afterSelectRolesForPlayers", (playerCollection, gameTable) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
        gameHandler.playerActionManager.clearAll();
        gameHandler.selectCharactersForPlayers();
    });

    gameHandler.on("afterSelectCharactersForPlayers", (playerCollection) => {
        // serverHook.emit("updateFullDataClients", playerCollection);
        gameHandler.playerActionManager.clearAll();
        gameHandler.executeMovesRound();
    });

    gameHandler.on("afterMovesRound", () => {
        gameHandler.playerActionManager.clearAll();
        // gameHandler.executeMovesRound();
    });

    gameHandler.on("endDrawCards", ({ player, playerCollection, gameTable }) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
        serverHook.emit("lockPlayerMove", player);
    });

    gameHandler.on("endCardTurnPlayer", ({ player, playerCollection, gameTable }) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
        serverHook.emit("lockPlayerMove", player);
    });

    gameHandler.on("endFinishedHandler", ({ player, playerCollection, gameTable }) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
        serverHook.emit("lockPlayerMove", player);
    });

    gameHandler.on("selectionStarted", ({ player, selectionCards }) => {
        if (
            !(player instanceof Player || player === null) ||
            !(selectionCards instanceof SelectionCards)
        ) {
            return; // Если проверки не прошли, прерываем выполнение
        }

        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                (player === null || client?.sessionId === player.sessionId)
            ) {
                client.send(
                    JsonRpcFormatter.serializeRequest("selectionCardsMenu", selectionCards)
                );
            }
        });
    });

    gameHandler.on("selectionHide", ({ player }) => {
        if (!(player instanceof Player) && player !== null) {
            return;
        }

        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                (player === null || client?.sessionId === player.sessionId)
            ) {
                client.send(
                    JsonRpcFormatter.serializeRequest("selectionCardsMenu", { hide: true })
                );
            }
        });
    });

    gameHandler.on("selectionEnd", ({ playerCollection, gameTable }) => {
        serverHook.emit("updateFullDataClients", playerCollection, gameTable);
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
                player.weapon = new StubCard({ type: CardType.WEAPON });
                player.temporaryCards.setCards([
                    new StubCard({ type: CardType.DEFAULT }),
                    new StubCard({ type: CardType.DEFAULT }),
                    new StubCard({ type: CardType.WEAPON }),
                    new StubCard(CardType.CHARACTER),
                ]);
                ws.send(JsonRpcFormatter.serializeRequest("getMyPlayer", player?.getInfo()));

                if (!gameHandler.isStartGame()) {
                    serverHook.emit(
                        "requestAllUser",
                        "createAllGameBoard",
                        playroomHandler.getAllPlayersSummaryInfo()
                    );
                } else {
                    serverHook.emit(
                        "updateFullDataClients",
                        gameHandler.getLastMove().players,
                        gameHandler.getLastMove().gameTable
                    );
                }

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
