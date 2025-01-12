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
const { aCard, CardType, CardSuit, CardRank } = require("../interfaces/aCard");

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
const BangCard = require("../models/cards/defaultCards/BangCard");
const CardError = require("../Errors/CardError");
const WeaponCard = require("../models/cards/WeaponCard");
const DefaultCard = require("../models/cards/DefaultCard");
const ConstantCard = require("../models/cards/ConstantCard");
const RemingtonCard = require("../models/cards/weapons/RemingtonCard");
const CardInteractionError = require("../Errors/CardInteractionError");
const GameTableInteractionError = require("../Errors/GameTableInteractionError");
const BarrelCard = require("../models/cards/constCards/BarrelCard");

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
            WeaponCard,
            BangCard,
            DefaultCard,
            ConstantCard,
            RemingtonCard,
            BarrelCard,
        ];

        this.playroomHandler = playroomHandler;
        // Решил делать дальше без у чета сохранения
        // this.gameSessionHandler = new GameSessionHandler(true, 1);
        this.storage = {
            statusGame: false,
            rolesCards: new CardsCollection(),
            charactersCards: new CardsCollection(),
            gameCards: new CardsCollection(),

            /**
             * @property {Move}
             */
            move: new Move(),
        };

        this.playerActionManager = new PlayerActionManager();
    }

    /**
     * Запускает игру.
     * @fires GameHandler#beforeGameStart
     * @fires GameHandler#afterGameStart
     */
    startGame() {
        this.emit("beforeGameStart");

        this.storage.rolesCards = new CardsCollection([
            new BanditCard(),
            // new BanditCard(),
            // new BanditCard(),
            // new RenegadeCard(),
            new SheriffCard(),
            // new DeputySheriffCard(),
            // new DeputySheriffCard(),
        ]);
        this.storage.charactersCards = new CardsCollection([
            new BartCassidy(),
            new BlackJack(),
            new CalamityJanet(),
            new ElGringo(),
        ]);
        this.storage.gameCards = new CardsCollection([
            new BangCard({ rank: CardRank.ACE, suit: CardSuit.SPADES }),
            new BangCard({ rank: CardRank.TWO, suit: CardSuit.HEARTS }),
            new BangCard({ rank: CardRank.THREE, suit: CardSuit.HEARTS }),
            new RemingtonCard(),
            new BangCard({ rank: CardRank.FIVE, suit: CardSuit.HEARTS }),
            new BangCard({ rank: CardRank.SIX, suit: CardSuit.HEARTS }),
            new BangCard({ rank: CardRank.SEVEN, suit: CardSuit.DIAMONDS }),
            new BarrelCard({ rank: CardRank.QUEEN, suit: CardSuit.SPADES }),
            new RemingtonCard(),
            new RemingtonCard(),
            new BangCard({ rank: CardRank.TWO, suit: CardSuit.HEARTS }),
            new BangCard({ rank: CardRank.THREE, suit: CardSuit.HEARTS }),
            new RemingtonCard(),
            new BarrelCard({ rank: CardRank.KING, suit: CardSuit.HEARTS }),
            new BarrelCard({ rank: CardRank.KING, suit: CardSuit.HEARTS }),
            new BarrelCard({ rank: CardRank.KING, suit: CardSuit.SPADES }),
        ]);

        const gameTable = new GameTable({
            deckMain: new CardsCollection(this.storage.gameCards.getAllCards()),
        });

        const tempPlayers = this.playroomHandler.playerOnline.copyPlayerCollectionFromCollection();
        this.storage.move = new Move({
            description: "Первый ход, инициализация первичных данных",
            players: tempPlayers,
            playersDistances: new DistanceHandler(tempPlayers.getPlayers()),
            gameTable: gameTable,
        });
        this.storage.statusGame = true;

        this.storage.move.players.getPlayers().forEach((movePlayer) => {
            if (movePlayer.events.listenerCount("roleInstalled") === 0) {
                movePlayer.events.on("roleInstalled", this.initRoleForPlayers.bind(this));
            }

            if (movePlayer.events.listenerCount("characterInstalled") === 0) {
                movePlayer.events.on("characterInstalled", this.initCharacterForPlayers.bind(this));
            }

            if (movePlayer.events.listenerCount("showCards") === 0) {
                movePlayer.events.on("showCards", this.showCards.bind(this));
            }

            if (movePlayer.events.listenerCount("cardPlayed") === 0) {
                movePlayer.events.on("cardPlayed", this.activateCard.bind(this));
            }

            if (movePlayer.events.listenerCount("playerMessage") === 0) {
                movePlayer.events.on("playerMessage", ({ message, initPlayer }) => {
                    this.emit("gameHandlerMessage", {
                        message: message,
                        player: initPlayer,
                    });
                });
            }

            if (movePlayer.events.listenerCount("beforeDrawCards") === 0) {
                movePlayer.events.on("beforeDrawCards", this.updateMove.bind(this));
            }

            if (movePlayer.events.listenerCount("endDrawCards") === 0) {
                movePlayer.events.on("endDrawCards", this.updateMove.bind(this));
            }

            if (movePlayer.events.listenerCount("playerStartedMove") === 0) {
                movePlayer.events.on("playerStartedMove", this.updateMove.bind(this));
            }

            if (movePlayer.events.listenerCount("endCardTurnPlayer") === 0) {
                movePlayer.events.on("endCardTurnPlayer", this.updateMove.bind(this));
            }

            if (movePlayer.events.listenerCount("endFinishedHandler") === 0) {
                movePlayer.events.on("endFinishedHandler", this.updateMove.bind(this));
            }
        });

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
        const players = this.storage.move.players.getPlayersWithoutRole();
        players.forEach((player) => {
            // this.saveAndTriggerHook(player, "selectionStarted", { player, selectionCards });

            const playerMain = this.playroomHandler.playerOnline.copyPlayerFromPlayerCollection(
                player,
                player?.name,
                ["sessionId"]
            );

            if (playerMain instanceof Player) {
                playerMain.role = this.storage.rolesCards.pullRandomCard();
                this.storage.move.description = `Игроку ${player.name} была выдана роль ${playerMain.role.name}`;
                console.log(`Игроку ${player.name} была выдана роль ${playerMain.role.name}`);
            }
        });
        console.log("GameHandler: Все игроки получили роль.");

        this.storage.move.players.shufflePlayersWithSheriffFirst();
        this.storage.move.description = `Игроки были перемешаны. Шерифу получил минимальный id и теперь он первый в очереди.`;
        this.storage.move.playersDistances = new DistanceHandler(this.storage.move.players);
        console.log(
            "GameHandler: Игроки были перемешаны. Шерифу получил минимальный id и теперь он первый в очереди."
        );
        this.emit(
            "afterSelectRolesForPlayers",
            this.storage.move.players,
            this.storage.move.gameTable
        );
    }

    /**
     * Ожидает выбора персонажей от игроков.
     * @fires GameHandler#selectionStarted
     * @fires GameHandler#afterSelectCharactersForPlayers
     * @fires GameHandler#selectionEnd
     * @listens GameHandler#playerCardSelected
     */
    async selectCharactersForPlayers() {
        // const playerSheriffFirst = lastMove.players.getPlayerByRoleClassName(SheriffCard);
        const playerWithMinId = this.storage.move.players.getPlayerWithMinIdWithoutCharacter();
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
                collectionCards: this.storage.charactersCards.getRandomCards(3),
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

            player.character = this.storage.charactersCards.pullCardById(selectedCards[0].id);
            this.saveAndTriggerHook(player, "selectionHide", { player });
            this.playerActionManager.clearHooksByPlayer(player);
            console.log(
                `GameHandler: Игрок ${player.name} выбрал себе персонажа ${player.character.name}`
            );

            this.saveAndTriggerHook(player, "selectionEnd", {
                playerCollection: this.storage.move.players,
                gameTable: this.storage.move.gameTable,
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
            this.emit("afterSelectCharactersForPlayers", this.storage.move.players);
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
        const playersRound = this.storage.move.players.getPlayersSortedAsc();
        for (const playerRnd of playersRound) {
            const player = this.playroomHandler.playerOnline.copyPlayerFromPlayerCollection(
                playerRnd,
                playerRnd?.name,
                ["sessionId"]
            );
            this.playerActionManager.clearHooksByPlayer(player);
            this.storage.move.playersDistances = new DistanceHandler(this.storage.move.players);

            player.events.emit("playerStartedMove", {
                player: player,
                playerCollection: this.storage.move.players,
                gameTable: this.storage.move.gameTable,
            });
            console.log(`GameHandler: Игрок ${player.name} начинает ход.`);

            // try {
            await this.moveDrawTwoCards(player, this.storage.move);

            const movePlayCard = (ws, params, id = null) => {
                // Проверяем, что sessionId из события совпадает с ожидаемым
                if (ws.sessionId === player.sessionId) {
                    const gameTable = this.storage.move.gameTable;
                    try {
                        // Игрок завершил ход, раз разрешение на событие только для этого игрока
                        // clearTimeout(timeout); // Очищаем таймер, если используем его

                        player.playCardToTable({
                            gameTable: gameTable,
                            cardId: params.id,
                            cardTargetName: params?.targetName ?? "",
                        });
                        player.events.emit("endCardTurnPlayer", {
                            player: player,
                            playerCollection: this.storage.move.players,
                            gameTable: gameTable,
                        });
                    } catch (error) {
                        if (error instanceof CardInteractionError) {
                            if (
                                !player.hand.hasCardById(error.card?.id) &&
                                gameTable.playedCards.hasCardById(error.card?.id)
                            ) {
                                player.hand.addCard(
                                    gameTable.playedCards.pullCardById(error.card?.id)
                                );
                            } else {
                                throw error;
                            }

                            console.log(error.message);
                            this.emit("gameHandlerMessage", {
                                message: error.message,
                                player: player,
                            });
                            return;
                        } else if (error instanceof GameTableInteractionError) {
                        } else {
                            throw error;
                        }
                    }

                    // После того как нужный игрок завершил ход, убираем обработчик
                    // this.removeListener("playCard", movePlayCard);
                } else {
                    console.log(
                        `Игрок с sessionId ${ws.sessionId} не может завершить ход для ${player.name}`
                    );
                }
            };

            this.on("playCard", movePlayCard);

            await this.waitForPlayerMoveFinished(player, this.storage.move, 30000);
            this.removeListener("playCard", movePlayCard);
            await this.moveDiscardExcessCards(player, this.storage.move);
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
                    // lastMove.gameTable.discardAllCardsFromTable();
                    lastMove.gameTable.clearAllCardsFromTable();

                    player.events.emit("endFinishedHandler", {
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

    /**
     * Асинхронное действие для хода, в котором игрок берет две карты.
     *
     * @param {Player} player - Игрок, который берет карты.
     * @param {Move} lastMove - Последний ход, содержащий данные о текущем состоянии игры.
     *
     * @fires GameHandler#beforeDrawCards   Вызывается перед тем, как игрок берет карты.
     * @fires GameHandler#endDrawCards      Вызывается после того, как игрок взял карты.
     *
     * @throws {Error} Бросает ошибку, если объекты `player` или `lastMove` не являются экземплярами соответствующих классов.
     */
    async moveDrawTwoCards(player, lastMove) {
        if (player instanceof Player && lastMove instanceof Move) {
            let selectedCards = [];

            /**
             * Событие, которое срабатывает перед взятием карт игроком.
             * @event GameHandler#beforeDrawCards
             * @type {object}
             * @property {Player} player - Игрок, который берет карты.
             * @property {PlayerCollection} playerCollection - Коллекция игроков.
             * @property {GameTable} gameTable - Игровая таблица.
             */
            player.events.emit("beforeDrawCards", {
                player: player,
                playerCollection: lastMove.players,
                gameTable: lastMove.gameTable,
            });

            try {
                selectedCards = player.drawFromDeck(lastMove.gameTable, 2);
            } catch (error) {
                if (error instanceof GameTableInteractionError) {
                    // Обрабатываем ошибку взаимодействия с игровой таблицей
                } else {
                    throw error;
                }
            }

            /**
             * Событие, которое срабатывает после того, как игрок взял карты.
             * @event GameHandler#endDrawCards
             * @type {object}
             * @property {Player} player - Игрок, который взял карты.
             * @property {PlayerCollection} playerCollection - Коллекция игроков.
             * @property {GameTable} gameTable - Игровая таблица.
             */
            player.events.emit("endDrawCards", {
                player: player,
                playerCollection: lastMove.players,
                gameTable: lastMove.gameTable,
            });

            const cardNames = selectedCards
                .filter((card) => card.name) // Фильтруем карты без имени
                .map((card) => card.name)
                .join(", ");

            console.log(
                `GameHandler: Этап "взятия": Игрок ${player.name} берет 2 карты: ${cardNames}, вначале своего хода`
            );
        } else {
            throw new Error(
                "Объект player должен быть экземпляром Player или объект lastMove должен быть экземпляром класса Move"
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
                    isWaitingForResponse: true,
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
                player.discardCards(lastMove.gameTable, selectedCards);

                // Сохраняется изменения в истории игры и вызывается событие Конца хода выбора игрока
                const cardNames = selectedCards
                    .filter((card) => card.name) // Фильтруем карты без имени
                    .map((card) => card.name)
                    .join(", ");

                // this.playerActionManager.clearHooksByPlayer(player);
                console.log(
                    `GameHandler: Этап "сброса": Игрок ${player.name} сбрасывает карту/ы ${cardNames}`
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

    showCards({ selectionCards, player = null }) {
        if (!(selectionCards instanceof SelectionCards)) {
            return;
        }
        // this.saveAndTriggerHook(player, "selectionStarted", { player: null, selectionCards });
        this.emit("selectionStarted", { player: null, selectionCards });

        // Отложенное событие для скрытия карт через 3 секунды
        setTimeout(() => {
            // this.saveAndTriggerHook(player, "selectionHide", { player: null });
            this.emit("selectionHide", { player: null });
        }, 3000); // 3000 миллисекунд = 3 секунды
    }

    activateCard({ player, card }) {
        const gameTable = this.storage.move.gameTable;

        if (!(player instanceof Player)) {
            throw new Error("GameHandler: Player must be an instance of Player.");
        }

        if (!(card instanceof aCard)) {
            throw new Error("GameHandler: Card must be an instance of a Card.");
        }

        if (card instanceof WeaponCard) {
            const oldWeapon = player.weapon;
            player.weapon = card;
            // if (gameTable.playedCards.hasCardById(card.id)) {
            //     gameTable.playedCards.pullCardById(card.id);
            // }

            card.action();

            if (oldWeapon instanceof WeaponCard) {
                gameTable.discardCards([oldWeapon]);
            }
        } else if (card instanceof ConstantCard) {
            if (player.temporaryCards.hasCardByName(card.name)) {
                throw new CardInteractionError(
                    `Игрок ${player.name}, походил карту ${card.name}, но она уже у него есть. (можно иметь только одну копию)`,
                    card
                );
            }

            player.temporaryCards.addCard(card);
            card.action({ player, gameTable });
        } else {
            card.action({
                players: this.storage.move.players,
            });

            gameTable.discardCards([card]);
        }
    }

    initRoleForPlayers({ card, player }) {
        if (player instanceof Player && card instanceof aCard && card.type === CardType.ROLE) {
            card.action({ player });
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

        card.action({
            player: player,
            gameTable: this.storage.move.gameTable,
        });
    }

    updateMove({ player, playerCollection, gameTable, oneUse = true }) {
        this.saveAndTriggerHook(player, "updateMove", { player, playerCollection, gameTable }, oneUse);
    }

    saveAndTriggerHook(player, nameHook, dataHook = {}, oneUse = false) {
        if (!(player instanceof Player)) {
            throw new Error("GameHandler: Передан неверный игрок для метода saveAndTriggerHook");
        }

        this.emit(nameHook, dataHook);
        if (oneUse && this.playerActionManager.findHookByName(player, nameHook) === null) {
            return;
        }

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
        return this.storage.statusGame;
    }
}

module.exports = GameHandler;
