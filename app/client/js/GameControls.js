class GameControls {
    constructor(selectorMainElement) {
        this.mainElement = document.querySelector(selectorMainElement);
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("GameControls: Invalid main element selector");
        }
    }

    showMainController() {
        this.mainElement.style.display = "flex";
        this.mainElement.style.height = "";
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
    }

    hideMainController() {
        this.mainElement.style.display = "none";
        this.mainElement.style.height = "";
        document.body.style.overflow = "";
    }

    floatingMainController() {
        this.mainElement.style.height = "auto";
        document.body.style.overflow = "";
    }
}

class CardSelection extends GameControls {
    _containerCards = [];
    _title = "";
    _description = "";
    _textExtension = "";
    _timer = null;
    _selectionCount = 0;
    _selectedIndices = [];
    _isWaitingForResponse = true;
    _queueData = [];

    constructor(selectorMainElement, selectorCardsSelection) {
        super(selectorMainElement);

        this.cardsSelection = this.mainElement?.querySelector(selectorCardsSelection);
        this.buttonCloseWindow = this.cardsSelection?.querySelector(".button-close-window");
        this.buttonSelectCards = this.cardsSelection?.querySelector(".button-end-move");
        this.collapseElement = this.cardsSelection?.querySelector(".icon-control-collapse");
        this.timerValueElement = this.cardsSelection?.querySelector(
            ".icon-round-timer .item-value"
        );
        this.containerElement = this.cardsSelection?.querySelector(".cards-container");
        this.headerElement = this.cardsSelection?.querySelector(".header");
        this.headerTitleElement = this.headerElement?.querySelector(":scope > h5");
        this.headerDescriptionElement = this.headerElement?.querySelector(":scope > p");
        this.textElement = this.mainElement?.querySelector(selectorCardsSelection + " > p");

        this.checkElements();
    }

    set title(value) {
        if (typeof value !== "string") {
            throw new Error("CardSelection.title(value): value must be string.");
        }
        this._title = value;
    }

    set description(value) {
        if (typeof value !== "string") {
            throw new Error("CardSelection.description(value): value must be string.");
        }
        this._description = value;
    }

    set textExtension(value) {
        if (typeof value !== "string") {
            throw new Error("CardSelection.textExtension(value): value must be string.");
        }
        this._textExtension = value;
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

    /**
     * @param {number} value
     */
    set selectionCount(value) {
        if (typeof value !== "number") {
            return;
        }
        this._selectionCount = value;
    }

    /**
     * Устанавливает массив выбранных ID.
     * @param {number[] | aCard[]} indices - Массив ID или объектов aCard.
     * @throws {Error} Если элементы массива не являются числами или экземплярами aCard.
     */
    set selectedIndices(indices) {
        if (!Array.isArray(indices)) {
            throw new Error("Аргумент должен быть массивом.");
        }

        if (!indices.every((item) => typeof item === "number" || item instanceof aCard)) {
            throw new Error("Элементы массива должны быть числами или экземплярами aCard.");
        }

        this._selectedIndices = indices.map((item) => (item instanceof CardModel ? item.id : item));
    }

    /**
     * Устанавливает состояние ожидания ответа.
     * @param {boolean} value - True, если сервер ожидает ответа.
     * @throws {SelectionCardsError} Если значение не булевое.
     */
    set isWaitingForResponse(value) {
        if (typeof value !== "boolean") {
            throw new SelectionCardsError("Состояние ожидания должно быть булевым значением.");
        }
        this._isWaitingForResponse = value;
    }

    /**
     * Добавляет ID или объект CardModelв выбранные элементы.
     * @param {number | aCard} index - ID карты или объект aCard.
     * @throws {Error} Если аргумент не число и не объект aCard.
     */
    addSelectedIndex(index) {
        if (typeof index === "number") {
            if (!this._selectedIndices.includes(index)) {
                this._selectedIndices.push(index);
            }
        } else if (index instanceof aCard) {
            if (!this._selectedIndices.includes(index.id)) {
                this._selectedIndices.push(index.id);
            }
        } else {
            throw new Error("Аргумент должен быть числом или экземпляром aCard.");
        }
    }

    get title() {
        if (typeof this._title !== "string") {
            throw new Error("CardSelection.title(value): value must be string.");
        }
        return this._title;
    }

    get description() {
        if (typeof this._description !== "string") {
            throw new Error("CardSelection.description(value): value must be string.");
        }
        return this._description;
    }

    get textExtension() {
        if (typeof this._textExtension !== "string") {
            throw new Error("CardSelection.textExtension(value): value must be string.");
        }
        return this._textExtension;
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

    get selectionCount() {
        if (typeof this._selectionCount !== "number") {
            throw new Error("BattleZone.selectionCount must be a number");
        }
        return this._selectionCount;
    }

    /**
     * Возвращает массив выбранных ID.
     * @returns {number[]} Массив ID выбранных карт.
     */
    get selectedIndices() {
        return [...this._selectedIndices];
    }

    /**
     * Возвращает состояние ожидания ответа.
     * @returns {boolean} True, если сервер ожидает ответа.
     */
    get isWaitingForResponse() {
        return this._isWaitingForResponse;
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
        this.headerTitleElement.innerHTML = this.title;
        this.headerDescriptionElement.innerHTML = this.description;
        this.textElement.innerHTML = this.textExtension;
        this.timerValueElement.innerHTML = this.timer ?? "--";

        if (!this.isWaitingForResponse) {
            this.buttonSelectCards.style.display = "none";
            this.buttonCloseWindow.style.display = "block";
        } else {
            this.buttonSelectCards.style.display = "block";
            this.buttonCloseWindow.style.display = "none";
        }

        this.renderContainerCards();
    }

    renderContainerCards() {
        // Полностью очищаем содержимое контейнера
        this.containerElement.innerHTML = "";

        this.containerCards.forEach((card, index) => {
            if (card instanceof CardModel) {
                if (!card.isCreatedCardElement()) {
                    card.createHtmlShell();
                }
                card.deactivateDrag();
                this.containerElement.append(card.cardElement);

                if (this.selectedIndices.includes(card.cardId)) {
                    card.enablesSelectionByOpponent();
                }
            }
        });

        window.dispatchEvent(new CustomEvent("updateSizeZone"));
    }

    checkElements() {
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("Invalid main element selector");
        }
        if (!(this.cardsSelection instanceof HTMLElement)) {
            throw new Error("Invalid cards selection selector");
        }
        if (!(this.buttonSelectCards instanceof HTMLElement)) {
            throw new Error("Invalid select cards card selection selector");
        }
        if (!(this.collapseElement instanceof HTMLElement)) {
            throw new Error("Invalid collapse card selection selector");
        }
        if (!(this.buttonCloseWindow instanceof HTMLElement)) {
            throw new Error("Invalid close card selection selector");
        }
        if (!(this.containerElement instanceof HTMLElement)) {
            throw new Error("Invalid container card selection selector");
        }
        if (!(this.headerElement instanceof HTMLElement)) {
            throw new Error("Invalid header card selection selector");
        }
        if (!(this.textElement instanceof HTMLElement)) {
            throw new Error("Invalid text card selection selector");
        }
        if (!(this.headerTitleElement instanceof HTMLElement)) {
            throw new Error("Invalid header title card selection selector");
        }
        if (!(this.headerDescriptionElement instanceof HTMLElement)) {
            throw new Error("Invalid header description card selection selector");
        }
        if (!(this.timerValueElement instanceof HTMLElement)) {
            throw new Error("Invalid timer value card selection selector");
        }
    }

    init() {
        this.setupCollapseListener();
        this.setupButtonSelectCardListener();
        this.setupButtonCloseListener();
    }

    initData(data) {
        this.title = data?.title;
        this.description = data?.description;
        this.textExtension = data?.textExtension;
        this.selectionCount = data?.selectionCount;
        this.selectedIndices = data?.selectedIndices;
        this.isWaitingForResponse = data?.isWaitingForResponse;
        this.timer = data?.timer;
        this.setCardToContainer(data?.collectionCards ?? []);

        this.renderUpdatedData();
        this.setupCardListener();
        this.showMainController();
    }

    /**
     * Добавляет элемент в очередь.
     * @param {*} data - Данные, которые нужно добавить в очередь.
     */
    addInQueueData(data) {
        this._queueData.push(data);
    }

    /**
     * Удаляет первого элемента из очереди.
     * @returns {*} Удаленный элемент из очереди, или `null`, если очередь пуста.
     */
    removeFromQueueData() {
        if (this._queueData.length === 0) {
            return null; // Очередь пуста
        }
        return this._queueData.shift(); // Удаляет и возвращает первый элемент очереди
    }

    /**
     * Получает первый элемент из очереди без его удаления.
     * @returns {*} Первый элемент очереди, или `null`, если очередь пуста.
     */
    peekFromQueueData() {
        return this._queueData.length > 0 ? this._queueData[0] : null;
    }

    /**
     * Инициализирует первые данные в очереди
     */
    initFirstQueueData() {
        if (this._queueData.length === 0) {
            return null; // Очередь пуста
        }

        this.initData(this.peekFromQueueData());
    }

    /**
     * Проверяет, пуста ли очередь.
     * @returns {boolean} `true`, если очередь пуста, иначе `false`.
     */
    isEmptyQueueData() {
        return this._queueData.length === 0;
    }

    setupButtonCloseListener() {
        this.buttonCloseWindow.addEventListener("click", () => {
            this.title = "";
            this.description = "";
            this.textExtension = "";
            this.selectionCount = 0;
            this.selectedIndices = [];
            this.isWaitingForResponse = true;
            this.timer = null;
            this.setCardToContainer([]);

            this.renderUpdatedData();
            this.hideMainController();

            this.removeFromQueueData();
            if (!this.isEmptyQueueData()) {
                this.initFirstQueueData();
            }
        });
    }

    setupButtonSelectCardListener() {
        this.buttonSelectCards.addEventListener("click", () => {
            // console.log(this.selectionCount);

            if (this.selectionCount === 0) {
                this.hideMainController();

                this.removeFromQueueData();
                if (!this.isEmptyQueueData()) {
                    this.initFirstQueueData();
                }

                document.dispatchEvent(
                    new CustomEvent("sendServer", {
                        detail: {
                            data: this.containerCards.filter((card) => card.isSelection()),
                            action: "playerCardSelected",
                        },
                    })
                );
            } else {
                console.log(`Должны быть выбраны еще ${this.selectionCount} кард.`);

                // throw new Error(`Должны быть выбраны еще ${this.selectionCount} кард.`);
            }
        });
    }

    setupCollapseListener() {
        let iElement = this.collapseElement?.querySelector("i");

        this.collapseElement.addEventListener("click", () => {
            if (
                this.headerElement.style.display === "" &&
                this.textElement.style.display === "" &&
                this.containerElement.style.display === ""
            ) {
                this.headerElement.style.display = "none";
                this.textElement.style.display = "none";
                this.containerElement.style.display = "none";
                this.floatingMainController();
                this.cardsSelection.style.padding = "4px";
                this.cardsSelection.style.margin = "4px 0px";

                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-collapse")) {
                        iElement.classList.remove("icon-collapse");
                        iElement.classList.add("icon-expand");
                    }
                }
            } else {
                this.headerElement.style.display = "";
                this.textElement.style.display = "";
                this.containerElement.style.display = "";
                this.showMainController();
                this.cardsSelection.style.padding = "";
                this.cardsSelection.style.margin = "";

                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-expand")) {
                        iElement.classList.remove("icon-expand");
                        iElement.classList.add("icon-collapse");
                    }
                }
            }
        });
    }

    setupCardListener() {
        this.containerCards.forEach((card, index) => {
            if (card instanceof CardModel && card.isCreatedCardElement()) {
                card.cardElement.addEventListener("click", (e) => {
                    if (card.isSelection()) {
                        // Если карта уже выбрана, снимаем выбор и увеличиваем доступное количество
                        card.toggleSelection();
                        this.selectionCount++;
                    } else if (this.selectionCount > 0) {
                        // Если карта не выбрана и доступно еще количество для выбора
                        card.toggleSelection();
                        this.selectionCount--;
                    } else {
                        // Если лимит выбора исчерпан, не даем выбрать карту
                        // console.warn("Вы не можете выбрать больше карт.");
                    }
                });
            }
        });
    }
}
