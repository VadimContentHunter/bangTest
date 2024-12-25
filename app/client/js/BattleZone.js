class BattleZone {
    _containerCards = [];
    _timer = null;
    _countMainDeck = 0;
    _countDiscardPile = 0;

    constructor(selectorMainElement) {
        this.mainElement = document.querySelector(selectorMainElement);
        this.collectionCardsElement = this.mainElement?.querySelector(".cards-container");
        this.valueMainDeckElement = this.mainElement?.querySelector(
            ".controls .icon-deck-main .item-value"
        );
        this.valueDiscardPileElement = this.mainElement?.querySelector(
            ".controls .icon-deck-discard .item-value"
        );
        this.valueTimerElement = this.mainElement?.querySelector(
            ".controls .icon-round-timer .item-value"
        );
        this.valueButtonEndMoveElement = this.mainElement?.querySelector(".controls button");

        this.checkElements();
    }

    set countMainDeck(value) {
        if (typeof value !== "number") {
            throw new Error("BattleZone.countMainDeck(value): value must be number.");
        }
        this._countMainDeck = value;
    }

    set countDiscardPile(value) {
        if (typeof value !== "number") {
            throw new Error("BattleZone.countDiscardPile(value): value must be number.");
        }
        this._countDiscardPile = value;
    }

    set timer(value) {
        if (typeof value !== "number") {
            return;
        }
        this._timer = value;
    }

    set containerCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("BattleZone.containerCards(value): value must be an array.");
        }

        // Преобразуем массив и фильтруем только корректные данные
        this._containerCards = value
            .map((data) => {
                try {
                    return CardModel.init(
                        data?.id,
                        data?.type,
                        data?.image,
                        data?.ownerName,
                        data?.targetName
                    );
                } catch (e) {
                    if (e instanceof CardModelError) {
                        console.error(e.message);
                        return null; // Пропускаем некорректный элемент
                    }
                    throw e; // Пробрасываем другие ошибки
                }
            })
            .filter(Boolean); // Убираем null-значения из массива
    }

    get countMainDeck() {
        if (typeof this._countMainDeck !== "number") {
            throw new Error("BattleZone.countMainDeck(value): value must be number.");
        }
        return this._countMainDeck;
    }

    get countDiscardPile() {
        if (typeof this._countDiscardPile !== "number") {
            throw new Error("BattleZone.countDiscardPile(value): value must be number.");
        }
        return this._countDiscardPile;
    }

    get timer() {
        return this._timer;
    }

    get containerCards() {
        if (!Array.isArray(this._containerCards)) {
            throw new Error("BattleZone.containerCards(value): value must be an array.");
        }

        // Проверяем, что все элементы массива являются экземплярами CardModel
        if (!this._containerCards.every((card) => card instanceof CardModel)) {
            throw new Error(
                "BattleZone.containerCards: all elements of _containerCards must be instances of CardModel."
            );
        }

        return this._containerCards;
    }

    addCardToContainer(value) {
        if (!(value instanceof CardModel)) {
            try {
                value = CardModel.init(
                    value?.id,
                    value?.type,
                    value?.image,
                    value?.ownerName,
                    value?.targetName
                );
            } catch (e) {
                if (e instanceof CardModelError) {
                    console.error(e.message);
                    return null; // Пропускаем некорректный элемент
                }
                throw e; // Пробрасываем другие ошибки
            }
        }

        this.containerCards.push(value);
    }

    setCardToContainer(cards) {
        if (!Array.isArray(cards)) {
            throw new Error("CardSelection.setCardToContainer(cards): cards must be an array.");
        }

        // Очищаем текущий массив
        this._containerCards = [];

        // Используем addCardToContainer для добавления каждой карты
        cards.forEach((card) => {
            this.addCardToContainer(card);
        });

        // Обновляем UI
        // this.renderUpdatedData();
    }

    renderUpdatedData() {
        this.valueMainDeckElement.innerHTML = this.countMainDeck;
        this.valueDiscardPileElement.innerHTML = this.countDiscardPile;
        this.valueTimerElement.innerHTML = this.timer ?? "--";

        this.renderContainerCards();
    }

    renderContainerCards() {
        // Полностью очищаем содержимое контейнера
        this.collectionCardsElement.innerHTML = "";

        this.containerCards.forEach((card, index) => {
            if (card instanceof CardModel) {
                if (!card.isCreatedCardElement()) {
                    card.createHtmlShell();
                }

                const divContainerTitle = document.createElement("div");
                divContainerTitle.classList.add("shell-card");
                divContainerTitle.innerHTML = `
                    <div class="content-container">
                        <p class="card-owner">${card.ownerName}</p>
                        <p class="card-target">${card.targetName}</p>
                    </div>
                `;

                card.deactivateDrag();
                divContainerTitle.prepend(card.cardElement);
                this.collectionCardsElement.append(divContainerTitle);
            }
        });

        window.dispatchEvent(new CustomEvent("updateSizeZone"));
    }

    checkElements() {
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid main element selector");
        }
        if (!(this.collectionCardsElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid collection cards element selector");
        }
        if (!(this.valueMainDeckElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid value main deck element selector");
        }
        if (!(this.valueDiscardPileElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid value discard pile element selector");
        }
        if (!(this.valueTimerElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid value timer element selector");
        }
        if (!(this.valueButtonEndMoveElement instanceof HTMLElement)) {
            throw new Error("BattleZone: Invalid value button end move element selector");
        }
    }

    init() {
        // this.setupDragCardListener();
        // this.setupButtonEndMoveVisible();
        this.valueButtonEndMoveElement.style.display = "none";
    }

    setupButtonEndMoveVisible(playerHand) {
        if (playerHand instanceof PlayerHand) {
            if (playerHand.isMyMove) {
                this.valueButtonEndMoveElement.style.display = "block";
            } else {
                this.valueButtonEndMoveElement.style.display = "none";
            }
        }
    }

    setupButtonEndMoveListener() {
        this.valueButtonEndMoveElement.addEventListener("click", () => {
            document.dispatchEvent(
                new CustomEvent("sendServer", {
                    detail: {
                        data: {},
                        action: "playerMoveFinished",
                    },
                })
            );
            this.valueButtonEndMoveElement.style.display = "none";
        });
    }

    setupDragCardListener(playerHand, notificationsHtml) {
        requestAnimationFrame(() => {
            if (playerHand instanceof PlayerHand) {
                // Создаем переменную для хранения rect
                let rect = this.mainElement.getBoundingClientRect();

                // Функция для обновления rect
                const updateRect = () => {
                    rect = this.mainElement.getBoundingClientRect();
                };

                // Обновляем rect при изменении размера окна и прокрутке
                window.addEventListener("resize", updateRect);
                window.addEventListener("scroll", updateRect);
                window.addEventListener("updateSizeZone", updateRect);

                // Обработчик мыши
                document.addEventListener("card-mousemove", (e) => {
                    const { cardModel, event } = e.detail;
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;

                    // Проверка на то Может ли игрок выполнить ход
                    if (!playerHand.isMyMove) {
                        return;
                    }

                    // Проверяем, находится ли мышь внутри прямоугольника
                    if (
                        cardModel instanceof CardModel &&
                        mouseX >= rect.left &&
                        mouseX <= rect.right &&
                        mouseY >= rect.top &&
                        mouseY <= rect.bottom
                    ) {
                        if (!this.mainElement.classList.contains("hover-card")) {
                            this.mainElement.classList.add("hover-card");
                        }
                    } else {
                        this.mainElement.classList.remove("hover-card");
                    }
                });

                document.addEventListener("card-mouseup", (e) => {
                    const { cardModel, event } = e.detail;
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;

                    // Проверка на то Может ли игрок выполнить ход
                    if (!playerHand.isMyMove) {
                        notificationsHtml.addNotification(
                            "Сейчас не ваш ход. Дождитесь своего хода!"
                        );
                        return;
                    }

                    // Проверяем, находится ли мышь внутри прямоугольника
                    if (
                        cardModel instanceof CardModel &&
                        mouseX >= rect.left &&
                        mouseX <= rect.right &&
                        mouseY >= rect.top &&
                        mouseY <= rect.bottom
                    ) {
                        this.mainElement.classList.remove("hover-card");
                        // this.addCardToContainer(playerHand.pullCard(cardModel));
                        // this.renderContainerCards();
                        document.dispatchEvent(
                            new CustomEvent("sendServer", {
                                detail: {
                                    data: cardModel,
                                    action: "playCard",
                                },
                            })
                        );
                    }
                });
            }
        });
    }
}
