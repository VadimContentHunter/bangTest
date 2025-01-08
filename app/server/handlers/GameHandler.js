const GameHandlerError = require("../Errors/GameHandlerError");
const EventEmitter = require("events");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const GameTableError = require("../Errors/GameTableError");
const GameTable = require("../models/GameTable");
const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const HistoryHandler = require("../handlers/HistoryHandler");
const MoveError = require("../Errors/MoveError");
const Move = require("../models/Move");
const CardsCollection = require("../handlers/CardsCollection");
const SelectionCardsError = require("../Errors/SelectionCardsError");
const SelectionCards = require("../models/SelectionCards");
const { aCard, CardType, CardSuit } = require("../interfaces/aCard");

const StubCard = require("../models/cards/StubCard");
const PlayerActionManager = require("./PlayerActionManager");
const BanditCard = require("../models/cards/roles/BanditCard");
const RenegadeCard = require("../models/cards/roles/RenegadeCard");
const SheriffCard = require("../models/cards/roles/SheriffCard");
const DeputySheriffCard = require("../models/cards/roles/DeputySheriffCard");
const BartCassidy = require("../models/cards/characters/BartCassidy");
const BlackJack = require("../models/cards/characters/BlackJack");
const CalamityJanet = require("../models/cards/characters/CalamityJanet");
const ElGringo = require("../models/cards/characters/ElGringo");

/**
 * @event GameHandler#beforeGameStart
 * @description Событие испускается непосредственно перед запуском игры.
 */

/**
 * @event GameHandler#afterGameStart
 * @description Событие испускается сразу после успешного старта игры.
 */

/**
 * @event GameHandler#selectionStarted
 * @description Событие испускается, когда начинается процесс выбора карты.
 * @param {Object} player - Игрок, который должен выбрать карту.
 * @param {Object} selectionCards - Набор карт для выбора.
 */

/**
 * @event GameHandler#playerCardSelected
 * @description Событие испускается, когда игрок выбирает карту.
 * @param {Object} ws - Объект WebSocket для работы с соединением.
 * @param {Object} params - Параметры, содержащие информацию о выбранной карте.
 * @param {string} [id=null] - Дополнительный идентификатор для выбора карты.
 */

/**
 * @event GameHandler#afterSelectCharactersForPlayers
 * @description Событие испускается, когда игроки закончили выбирать карты.
 * @param {PlayerCollection} playerCollection - Объект PlayerCollection для работы с коллекцией игроков.
 */

/**
 * @event GameHandler#selectionEnd
 * @description Испускается, когда процесс выбора игрока завершён (когда игрок выбрал карту).
 * @param {PlayerCollection} playerCollection - Объект PlayerCollection для работы с коллекцией игроков.
 */

/**
 * @event GameHandler#playerStartedMove
 * @description Событие испускается, когда игрок начинает выполнять ход.
 * @param {Object} player - Игрок, который начинает ход.
 */

/**
 * @event GameHandler#playerMoveFinished
 * @description Событие испускается, когда игрок завершает свой ход.
 * @param {Object} player - Игрок, который завершил ход.
 */

/**
 * @event GameHandler#afterSelectRolesForPlayers
 * @description Событие, испускаемое после того, как всем игрокам назначены роли.
 * @param {PlayerCollection} playerCollection - Объект PlayerCollection для работы с коллекцией игроков.
 */

/**
 * Класс GameHandler управляет игровой логикой и испускает события для уведомления об изменениях.
 * @extends EventEmitter
 * @fires GameHandler#beforeGameStart - Событие, испускаемое перед началом игры.
 * @fires GameHandler#afterGameStart - Событие, испускаемое сразу после старта игры.
 * @fires GameHandler#afterSelectCharacterForPlayer - Событие, испускаемое после завершения выбора персонажа для всех игроков.
 * @fires GameHandler#selectionStarted - Событие, испускаемое при начале выбора карты.
 * @listens GameHandler#playerCardSelected - Слушает событие выбора карты игроком и обрабатывает его.
 * @fires GameHandler#playerStartedMove - Событие, испускаемое при начале выбора карты.
 * @listens GameHandler#playerMoveFinished - Слушает событие когда игрок завершает свой ход.
 * @fires GameHandler#afterSelectCharactersForPlayers - Событие испускается, когда игроки закончили выбирать карты.
 * @fires GameHandler#selectionEnd - Испускается, когда процесс выбора игрока завершён (когда игрок выбрал карту).
 * @fires afterSelectRolesForPlayers - Событие, испускаемое после того, как всем игрокам назначены роли.
 */
class GameHandler extends EventEmitter {
    constructor(playroomHandler) {
        super();
        if (!(playroomHandler instanceof PlayroomHandler)) {
            throw new Error("GameHandler: playroomHandler must be an instance of PlayroomHandler");
        }

        CardsCollection.typesCards = [
            StubCard,
            BanditCard,
            RenegadeCard,
            SheriffCard,
            DeputySheriffCard,
            BartCassidy,
            BlackJack,
            CalamityJanet,
            ElGringo,
        ];

        this.playroomHandler = playroomHandler;
        this.gameSessionHandler = new GameSessionHandler(true, 2);
        this.playerActionManager = new PlayerActionManager();
    }

    /**
     * Запускает игру.
     * @fires GameHandler#beforeGameStart
     * @fires GameHandler#afterGameStart
     */
    startGame() {
        this.emit("beforeGameStart");

        this.gameSessionHandler.head.collectionRolesCards = new CardsCollection([
            new BanditCard(),
            // new BanditCard(),
            // new BanditCard(),
            // new RenegadeCard(),
            new SheriffCard(),
            // new DeputySheriffCard(),
            // new DeputySheriffCard(),
        ]);
        this.gameSessionHandler.head.collectionCharactersCards = new CardsCollection([
            new BartCassidy(),
            new BlackJack(),
            new CalamityJanet(),
            new ElGringo(),
        ]);
        this.gameSessionHandler.head.collectionGameCards = new CardsCollection([
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.HEARTS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.DIAMONDS }),
            new StubCard({ type: CardType.WEAPON, suit: CardSuit.CLUBS }),
            new StubCard({ type: CardType.WEAPON, suit: CardSuit.DIAMONDS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.SPADES }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.CLUBS }),
            new StubCard({ type: CardType.WEAPON, suit: CardSuit.HEARTS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.CLUBS }),
            new StubCard({ type: CardType.WEAPON, suit: CardSuit.HEARTS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.DIAMONDS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.CLUBS }),
            new StubCard({ type: CardType.DEFAULT, suit: CardSuit.DIAMONDS }),
        ]);

        const tempPlayers = this.playroomHandler.playerOnline.copyPlayerCollectionFromCollection();
        tempPlayers.getPlayers().forEach((player) => {
            player.events.on("roleInstalled", this.initRoleForPlayers.bind(this));
            player.events.on("characterInstalled", this.initCharacterForPlayers.bind(this));
            player.events.on("showCards", (cards) => {
                /**
                 * Событие, которое вызывает отображение карт.
                 * @event GameTable#showCards
                 * @type {Object}
                 * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
                 * @property {Player} player - игрок с которым связано событие
                 */
                this.emit("showCards", this.showCards({ cards: cards, player }).bind(this));
            });
        });

        this.gameSessionHandler.history.addMove(
            new Move({
                description: "Первый ход, инициализация первичных данных",
                players: tempPlayers,
                playersDistances: new DistanceHandler(tempPlayers.getPlayers()),
                gameTable: new GameTable({
                    deckMain: new CardsCollection(
                        this.gameSessionHandler.head.collectionGameCards.getAllCards()
                    ),
                }),
            })
        );
        this.gameSessionHandler.createGameSession();

        this.emit("afterGameStart");
    }

    /**
     * Выбирает и назначает роли игрокам, которые ещё не имеют роли, в текущей игровой сессии.
     * После назначения ролей сохраняет изменения в истории и данных игры, а затем вызывает событие.
     *
     * @returns {void}
     *
     * @fires afterSelectRolesForPlayers - Событие, испускаемое после того, как всем игрокам назначены роли.
     */
    selectRolesForPlayers() {
        let lastMove = this.getLastMove();
        const players = lastMove.players.getPlayersWithoutRole();
        players.forEach((player) => {
            // this.saveAndTriggerHook(player, "selectionStarted", { player, selectionCards });

            const playerMain = this.playroomHandler.playerOnline.copyPlayerFromPlayerCollection(
                player,
                player?.name,
                ["sessionId"]
            );

            if (playerMain instanceof Player) {
                playerMain.role =
                    this.gameSessionHandler.head.collectionRolesCards.pullRandomCard();
                this.gameSessionHandler.history.addMove(
                    new Move({
                        description: `Игроку ${player.name} была выдана роль ${playerMain.role.name}`,
                        players: lastMove.players,
                        playersDistances: lastMove.playersDistances,
                        gameTable: lastMove.gameTable,
                    })
                );
                this.gameSessionHandler.saveData();
                console.log(`Игроку ${player.name} была выдана роль ${playerMain.role.name}`);
            }
        });
        console.log("GameHandler: Все игроки получили роль.");

        lastMove = this.getLastMove();
        lastMove.players.shufflePlayersWithSheriffFirst();
        this.gameSessionHandler.history.addMove(
            new Move({
                description: `Игроки были перемешаны. Шерифу получил минимальный id и теперь он первый в очереди.`,
                players: lastMove.players,
                playersDistances: new DistanceHandler(lastMove.players),
                gameTable: lastMove.gameTable,
            })
        );
        this.gameSessionHandler.saveData();

        console.log(
            "GameHandler: Игроки были перемешаны. Шерифу получил минимальный id и теперь он первый в очереди."
        );
        this.emit("afterSelectRolesForPlayers", lastMove.players, lastMove.gameTable);
    }

    /**
     * Ожидает выбора персонажей от игроков.
     * @fires GameHandler#selectionStarted
     * @fires GameHandler#afterSelectCharactersForPlayers
     * @fires GameHandler#selectionEnd
     * @listens GameHandler#playerCardSelected
     */
    async selectCharactersForPlayers() {
        const lastMove = this.getLastMove();
        // const playerSheriffFirst = lastMove.players.getPlayerByRoleClassName(SheriffCard);
        const playerWithMinId = lastMove.players.getPlayerWithMinIdWithoutCharacter();
        const player = this.playroomHandler.playerOnline.copyPlayerFromPlayerCollection(
            playerWithMinId,
            playerWithMinId?.name,
            ["sessionId"]
        );

        if (player instanceof Player) {
            // try {
            const selectionCards = new SelectionCards({
                title: "Выбор персонажа",
                description: "Выберите персонажа для игры:",
                textExtension: `Игрок <i>${player.name}</i> выбирает персонажа . . .`,
                collectionCards:
                    this.gameSessionHandler.head.collectionCharactersCards.getRandomCards(3),
                selectionCount: 1,
                // selectedIndices: [1, 3],
                // isWaitingForResponse: false,
            });

            // Выполняется отображение пользователю выбора карт и обработка выбранной карты
            // отображение будет повторяться пока пользователь не выберет карту именно персонажа
            let selectedCards = [];
            do {
                this.saveAndTriggerHook(player, "selectionStarted", { player, selectionCards });
                selectedCards = await this.waitForPlayerCardSelection(player, selectionCards);

                // Проверка: selectedCards — это массив и все карты в нем типа CardType.CHARACTER
            } while (
                !Array.isArray(selectedCards) ||
                !selectedCards.every(
                    (card) => card instanceof aCard && card.type === CardType.CHARACTER
                )
            );
            player.character = this.gameSessionHandler.head.collectionCharactersCards.pullCardById(
                selectedCards[0].id
            );

            // Сохраняется изменения в истории игры и вызывается событие Конца хода выбора игрока
            this.gameSessionHandler.history.addMove(
                new Move({
                    description: `Игрок ${player.name} выбрал себе персонажа ${player.character.name}`,
                    players: lastMove.players,
                    playersDistances: lastMove.playersDistances,
                    gameTable: lastMove.gameTable,
                })
            );
            this.gameSessionHandler.saveData();
            this.playerActionManager.clearHooksByPlayer(player);
            console.log(
                `GameHandler: Игрок ${player.name} выбрал себе персонажа ${player.character.name}`
            );

            this.saveAndTriggerHook(player, "selectionEnd", {
                playerCollection: lastMove.players,
                gameTable: lastMove.gameTable,
            });
            this.selectCharactersForPlayers(); // Рекурсивный вызов для следующего игрока
            // } catch (error) {
            //     console.error(
            //         `GameHandler: Ошибка выбора карты для игрока ${player.name}:`,
            //         error.message
            //     );
            // }
        } else {
            console.log("GameHandler: Все игроки выбрали персонажей.");
            this.emit("afterSelectCharactersForPlayers", lastMove.players);
        }
    }

    /**
     * Ожидает выбор карты игроком с таймером.
     * @param {Object} player - Игрок, который должен выбрать карту.
     * @param {SelectionCards} selectionCards - Объект с картами для выбора.
     * @param {number} timer - Таймаут ожидания в миллисекундах (по умолчанию 30000).
     * @returns {Promise<Object[]>} Возвращает массив выбранных карт.
     * @throws {SelectionCardsError} В случае ошибки выбора или истечения времени.
     * @listens GameHandler#playerCardSelected
     */
    async waitForPlayerCardSelection(player, selectionCards, timer = 30000) {
        console.log(`GameHandler: Ожидание выбора карты от игрока: ${player.name}`);

        return new Promise((resolve, reject) => {
            // const timeout = setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            // }, timer);

            const playerCardSelected = (ws, params, id = null) => {
                if (!Array.isArray(params)) {
                    console.log(`Игрок с sessionId ${ws.sessionId} передает не корректные данные.`);
                }
                // Проверяем, что sessionId из события совпадает с ожидаемым
                if (ws.sessionId === player.sessionId) {
                    const ids = params.map((item) => item?.id).filter(Boolean);
                    if (params.length > 0 && selectionCards.collectionCards.hasCardsByIds(ids)) {
                        resolve(selectionCards.collectionCards.pullCardsByIds(ids));
                    } else {
                        reject(new SelectionCardsError("Выбрана неверная карта."));
                    }

                    // После того как нужный игрок завершил ход, убираем обработчик
                    this.removeListener("playerCardSelected", playerCardSelected);
                } else {
                    console.log(
                        `Игрок с sessionId ${ws.sessionId} не может выбрать персонажа вместо ${player.name}`
                    );
                }
            };

            // Подписываемся на событие
            this.on("playerCardSelected", playerCardSelected);

            // В случае истечения времени или ошибки, обработчик должен быть удалён
            // setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            //     this.removeListener("playerMoveFinished", moveFinishedHandler); // Убираем обработчик при истечении таймаута
            // }, timer);

            // Важно помнить, что после вызова resolve() или reject() обработчик все равно будет оставаться.
            // Убедитесь, что он удаляется в любом случае.
        });
    }

    /**
     * Выполняет раунд ходов игроков.
     * @fires GameHandler#playerStartedMove - Событие, испускаемое, когда игрок начинает ход.
     * @listens GameHandler#playerMoveFinished - Слушает событие, когда игрок завершает свой ход.
     */
    async executeMovesRound() {
        const lastMove = this.getLastMove();
        const playersRound = lastMove.players.getPlayersSortedAsc();
        for (const playerRnd of playersRound) {
            const player = this.playroomHandler.playerOnline.copyPlayerFromPlayerCollection(
                playerRnd,
                playerRnd?.name,
                ["sessionId"]
            );
            this.playerActionManager.clearHooksByPlayer(player);

            this.saveAndTriggerHook(player, "playerStartedMove", {
                player: player,
                playerCollection: lastMove.players,
                gameTable: lastMove.gameTable,
            });

            console.log(`GameHandler: Игрок ${player.name} начинает ход.`);
            // try {
            await this.moveDrawTwoCards(player, lastMove);

            const movePlayCard = (ws, params, id = null) => {
                // Проверяем, что sessionId из события совпадает с ожидаемым
                if (ws.sessionId === player.sessionId) {
                    // Игрок завершил ход, раз разрешение на событие только для этого игрока
                    // clearTimeout(timeout); // Очищаем таймер, если используем его
                    const playerDiscardCard = player.hand.pullCardById(params.id);
                    lastMove.gameTable.addPlayerOneCard(player, playerDiscardCard);
                    this.emit("endCardTurnPlayer", {
                        player: player,
                        playerCollection: lastMove.players,
                        gameTable: lastMove.gameTable,
                    });
                    console.log(`Игрок ${player.name} походил карту ${playerDiscardCard.name}`);

                    // Сохраняется изменения в истории игры и вызывается событие Конца хода выбора игрока
                    this.gameSessionHandler.history.addMove(
                        new Move({
                            description: `Этап "Ход": Игрок ${player.name} походил карту ${playerDiscardCard.name}`,
                            players: lastMove.players,
                            playersDistances: lastMove.playersDistances,
                            gameTable: lastMove.gameTable,
                        })
                    );
                    this.gameSessionHandler.saveData();

                    // После того как нужный игрок завершил ход, убираем обработчик
                    // this.removeListener("playCard", movePlayCard);
                } else {
                    console.log(
                        `Игрок с sessionId ${ws.sessionId} не может завершить ход для ${player.name}`
                    );
                }
            };

            this.on("playCard", movePlayCard);

            await this.waitForPlayerMoveFinished(player, lastMove, 30000);
            this.removeListener("playCard", movePlayCard);
            await this.moveDiscardExcessCards(player, lastMove);
            console.log(`GameHandler: Игрок ${player.name} завершил ход.`);
            // } catch (error) {
            //     console.error(
            //         `GameHandler: Ошибка выполнения хода игроком ${player.name}: ${error.message}`
            //     );
            // }
        }
        this.emit("afterMovesRound");
    }

    /**
     * Ожидает завершения хода игроком с таймером.
     * @param {Player} player - Игрок, который должен завершить ход.
     * @param {Move} lastMove
     * @param {number} timer - Таймаут ожидания в миллисекундах (по умолчанию 30000).
     * @returns {Promise} Возвращает промис, который выполняется, когда игрок завершает ход.
     * @throws {MoveError} В случае ошибки или истечения времени.
     * @listens GameHandler#playerMoveFinished
     */
    async waitForPlayerMoveFinished(player, lastMove, timer = 30000) {
        if (!(player instanceof Player) && !(lastMove instanceof Move)) {
            throw new Error("Переданы некорректные данные.");
        }

        console.log(`GameHandler: Ожидание завершения хода от игрока: ${player.name}`);

        return new Promise((resolve, reject) => {
            // const timeout = setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            // }, timer);

            const moveFinishedHandler = (ws, params, id = null) => {
                // Проверяем, что sessionId из события совпадает с ожидаемым
                if (ws.sessionId === player.sessionId) {
                    // Игрок завершил ход, раз разрешение на событие только для этого игрока
                    // clearTimeout(timeout); // Очищаем таймер, если используем его
                    lastMove.gameTable.discardAllCardsFromTable();

                    this.emit("endFinishedHandler", {
                        player: player,
                        playerCollection: lastMove.players,
                        gameTable: lastMove.gameTable,
                    });

                    resolve();
                    // После того как нужный игрок завершил ход, убираем обработчик
                    this.removeListener("playerMoveFinished", moveFinishedHandler);
                } else {
                    console.log(
                        `Игрок с sessionId ${ws.sessionId} не может завершить ход для ${player.name}`
                    );
                }
            };

            // Подписываемся на событие
            this.on("playerMoveFinished", moveFinishedHandler);

            // В случае истечения времени или ошибки, обработчик должен быть удалён
            // setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            //     this.removeListener("playerMoveFinished", moveFinishedHandler); // Убираем обработчик при истечении таймаута
            // }, timer);

            // Важно помнить, что после вызова resolve() или reject() обработчик все равно будет оставаться.
            // Убедитесь, что он удаляется в любом случае.
        });
    }

    async moveDrawTwoCards(player, lastMove) {
        if (player instanceof Player && lastMove instanceof Move) {
            let selectedCards = [];
            lastMove.gameTable.drawCardFromMainDeck(2, player.hand);

            this.emit("endDrawCards", {
                player: player,
                playerCollection: lastMove.players,
                gameTable: lastMove.gameTable,
            });

            const cardNames = selectedCards
                .filter((card) => card.name) // Фильтруем карты без имени
                .map((card) => card.name)
                .join(", ");

            this.gameSessionHandler.history.addMove(
                new Move({
                    description: `Этап "взятия": Игрок ${player.name} берет 2 карты: ${cardNames}, вначале своего хода`,
                    players: lastMove.players,
                    playersDistances: lastMove.playersDistances,
                    gameTable: lastMove.gameTable,
                })
            );
            this.gameSessionHandler.saveData();
            // this.playerActionManager.clearHooksByPlayer(player);
            console.log(
                `GameHandler: Этап "взятия": Игрок ${player.name} берет 2 карты: ${cardNames}, вначале своего хода`
            );
        } else {
            throw new Error(
                "Объект player должны быть экземпляром Player или объект lastMove должен быть экземпляром класса Move"
            );
        }
    }

    async moveDiscardExcessCards(player, lastMove) {
        if (player instanceof Player && lastMove instanceof Move) {
            const countCardsHand = player.hand.countCards();
            if (countCardsHand > player.lives.current) {
                const countDiscardCards = countCardsHand - player.lives.current;
                const selectionCards = new SelectionCards({
                    title: `Выбор карт для сброса`,
                    description: `Выберите карты которые хотите сбросить. <b>Кол-во нужно выбрать [${countDiscardCards}]</b>:`,
                    textExtension: `Игрок <i>${player.name}</i> выбирает персонажа . . .`,
                    collectionCards: player.hand.getAllCards(),
                    selectionCount: countDiscardCards,
                    // selectedIndices: [1, 3],
                    // isWaitingForResponse: false,
                });

                // Выполняется отображение пользователю выбора карт и обработка выбранной карты
                // отображение будет повторяться пока пользователь не выберет карту именно персонажа
                let selectedCards = [];
                do {
                    this.saveAndTriggerHook(player, "selectionStarted", { player, selectionCards });
                    selectedCards = await this.waitForPlayerCardSelection(player, selectionCards);

                    // Проверка: selectedCards — это массив и все карты в нем типа CardType.CHARACTER
                } while (
                    !Array.isArray(selectedCards) ||
                    !selectedCards.every(
                        (card) =>
                            card instanceof aCard &&
                            card.type !== CardType.ROLE &&
                            card.type !== CardType.CHARACTER
                    )
                );
                lastMove.gameTable.discardCards(player.hand, selectedCards);

                // Сохраняется изменения в истории игры и вызывается событие Конца хода выбора игрока
                const cardNames = selectedCards
                    .filter((card) => card.name) // Фильтруем карты без имени
                    .map((card) => card.name)
                    .join(", ");

                this.gameSessionHandler.history.addMove(
                    new Move({
                        description: `Этап "спроса": Игрок ${player.name} сбрасывает карту/ы ${cardNames}`,
                        players: lastMove.players,
                        playersDistances: lastMove.playersDistances,
                        gameTable: lastMove.gameTable,
                    })
                );
                this.gameSessionHandler.saveData();
                // this.playerActionManager.clearHooksByPlayer(player);
                console.log(
                    `GameHandler: Этап "спроса": Игрок ${player.name} сбрасывает карту/ы ${cardNames}`
                );

                this.saveAndTriggerHook(player, "selectionEnd", {
                    playerCollection: lastMove.players,
                    gameTable: lastMove.gameTable,
                });
            }
        } else {
            throw new Error("Объект player должен быть экземпляром Player");
        }
    }

    showCards({ cards, player }) {
        // Проверка, что cards является массивом
        if (!Array.isArray(cards)) {
            throw new Error("Параметр 'cards' должен быть массивом");
        }

        if (!cards.every((card) => card instanceof aCard)) {
            throw new Error("Не все элементы массива являются экземплярами aCard");
        }

        const selectionCards = new SelectionCards({
            title: "Выбор персонажа",
            description: "Выберите персонажа для игры:",
            textExtension: `Игрок <i>${player.name}</i> выбирает персонажа . . .`,
            collectionCards:
                this.gameSessionHandler.head.collectionCharactersCards.getRandomCards(3),
            selectionCount: 1,
            // selectedIndices: [1, 3],
            // isWaitingForResponse: false,
        });

        this.saveAndTriggerHook(player, "selectionStarted", { player: null, selectionCards });

        // Отложенное событие для скрытия карт через 3 секунды
        setTimeout(() => {
            this.gameTable.events.emit("selectionHide", { player: null });
        }, 3000); // 3000 миллисекунд = 3 секунды
    }

    initRoleForPlayers({ card, player }) {
        if (player instanceof Player && card instanceof aCard && card.type === CardType.ROLE) {
            card.lives = player.lives;
            card.action();
        } else {
            throw new Error(
                "GameHandler: Role card must be instance of a Card and type must be ROLE"
            );
        }
    }

    initCharacterForPlayers({ card, player }) {
        if (!(player instanceof Player)) {
            throw new Error("GameHandler: Player must be an instance of Player.");
        }

        if (!(card instanceof aCard) || card.type !== CardType.CHARACTER) {
            throw new Error(
                "GameHandler: Character card must be an instance of aCard and type must be CHARACTER."
            );
        }

        const propertyMappings = {
            lives: player.lives,
            gameTable: this.getLastMove()?.gameTable,
            hand: player.hand,
        };

        // Динамическое присваивание свойств
        Object.keys(propertyMappings).forEach((key) => {
            if (key in card) {
                card[key] = propertyMappings[key];
            }
        });

        card.action();
    }

    /**
     * @returns {Move} Последний ход.
     */
    getLastMove() {
        this.gameSessionHandler.loadData();
        return this.gameSessionHandler.history.getLastMove();
    }

    saveAndTriggerHook(player, nameHook, dataHook = {}) {
        if (!(player instanceof Player)) {
            throw new Error("GameHandler: Передан неверный игрок для метода saveAndTriggerHook");
        }

        this.emit(nameHook, dataHook);
        this.playerActionManager.addHook(player, {
            name: nameHook,
            data: dataHook,
        });
    }

    triggerHooksForPlayer(player) {
        if (!(player instanceof Player)) {
            throw new Error("GameHandler: Передан неверный игрок для метода triggerHooksForPlayer");
        }

        const dataHook = this.playerActionManager.getHooksByPlayer(player);
        if (dataHook.length > 0) {
            dataHook.forEach((hook) => {
                this.emit(
                    PlayerActionManager.getHookName(hook),
                    PlayerActionManager.getHookData(hook)
                );
            });
        }
    }

    /**
     * @returns {boolean} Возвращает true, если игра началась, иначе false.
     */
    isStartGame() {
        return this.gameSessionHandler.head.statusGame;
    }
}

module.exports = GameHandler;
