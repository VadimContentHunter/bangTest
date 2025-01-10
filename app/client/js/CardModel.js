class CardModelError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class CardModel {
    static CardTypes = {
        ROLE: "role",
        CHARACTER: "character",
        WEAPON: "weapon",
        HAND: "hand",
        CONST: "const",
        DEFAULT: "default",
    };

    _cardId = null;
    _cardType = null;
    _ownerName = "";
    _targetName = "";
    _src = null;
    _timerDescription = {};
    _cardElement = null;
    _selectorDescriptionCart = null;
    _isDragging = false;

    constructor(cardId, cardType, src, ownerName = "", targetName = "") {
        this.cardId = cardId;
        this.cardType = cardType;
        this.ownerName = ownerName;
        this.targetName = targetName;
        this._src = src;
        this.selectorDescriptionCart = ".card-description";
    }

    set cardId(value) {
        if (!Number.isInteger(value)) {
            throw new CardModelError("cardId must be an integer.");
        }
        this._cardId = value;
    }

    set cardType(value) {
        if (!Object.values(CardModel.CardTypes).includes(value)) {
            throw new CardModelError(
                `cardType must be one of: ${Object.values(CardModel.CardTypes).join(", ")}`
            );
        }
        this._cardType = value;
    }

    set ownerName(value) {
        if (typeof value !== "string") {
            throw new CardModelError("ownerName must be a non-empty string.");
        }
        this._ownerName = value;
    }

    set targetName(value) {
        if (typeof value !== "string") {
            throw new CardModelError("targetName must be a non-empty string.");
        }
        this._targetName = value;
    }

    set timerDescription(value) {
        this._timerDescription = value;
    }

    set selectorDescriptionCart(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new CardModelError("selector for Description Cart must be a non-empty string.");
        }
        this._selectorDescriptionCart = value;
    }

    /**
     * @param {boolean} value
     */
    set isDragging(value) {
        if (typeof value !== "boolean") {
            throw new CardModelError("IsDragging must be a non-empty boolean.");
        }
        this._isDragging = value;
    }

    get cardId() {
        return this._cardId;
    }

    get cardType() {
        return this._cardType;
    }

    get ownerName() {
        return this._ownerName;
    }

    get targetName() {
        return this._targetName;
    }

    get timerDescription() {
        return this._timerDescription;
    }

    get src() {
        return this._src;
    }

    get cardElement() {
        return this._cardElement;
    }

    get delayDescription() {
        return 500;
    }

    get selectorDescriptionCart() {
        return this._selectorDescriptionCart;
    }

    get isDragging() {
        if (typeof this._isDragging !== "boolean") {
            throw new CardModelError("IsDragging must be a non-empty boolean.");
        }
        return this._isDragging;
    }

    isCreatedCardElement() {
        return this._cardElement instanceof HTMLElement;
    }

    /**
     * Генерация пользовательского события
     * @param {string} eventName
     * @param {Object} detail - Дополнительные данные события
     */
    triggerCustomEvent(eventName, detail = {}) {
        if (this.cardElement instanceof HTMLElement) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        }
    }

    // Метод для инициализации перетаскивания
    enableDrag() {
        if (!this.cardElement) return;

        this.isDragging = false;
        let offsetX, offsetY;
        let clonedElement = null;

        // Обработчик для начала перетаскивания
        this.cardElement.addEventListener("mousedown", (e) => {
            e.preventDefault(); // Предотвратить выделение текста

            const cardMovingBlockElement = document.querySelector("#card-moving-block");
            if (!(cardMovingBlockElement instanceof HTMLElement)) {
                throw new CardModelError("Не удалось найти блок перемещения карты.");
            }
            clonedElement = this.cardElement.cloneNode(true);
            clonedElement.originalElement = this.cardElement;
            cardMovingBlockElement.append(clonedElement);
            this.cardElement.style.opacity = "0.6";

            // Сохраняем начальные координаты относительно позиции блока
            const rect = clonedElement.getBoundingClientRect();
            offsetX = rect.left + 16;
            offsetY = rect.top + 16;

            clonedElement.style.left = `${e.clientX - offsetX}px`;
            clonedElement.style.top = `${e.clientY - offsetY}px`;

            // Применяем стили только когда нажата левая кнопка мыши
            if (e.button === 0) {
                // 0 — это левая кнопка мыши
                clonedElement.style.position = "absolute";
                clonedElement.style.zIndex = "1000";
            }

            this.isDragging = true;
            document.body.style.userSelect = "none"; // Отключаем выделение текста во время перетаскивания
            document.body.style.overflow = "hidden";
            this.triggerCustomEvent("card-mousedown", { event: e, cardModel: this });
        });

        // Обработчик для перемещения блока
        document.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                // const updateRect = () => {
                //     rect = this.mainElement.getBoundingClientRect();
                //     offsetX = rect.left + 16;
                //     offsetY = rect.top + 16;
                // };
                // window.addEventListener("resize", updateRect);

                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                // Устанавливаем новые координаты для блока
                clonedElement.style.left = `${x}px`;
                clonedElement.style.top = `${y}px`;

                this.triggerCustomEvent("card-mousemove", { event: e, cardModel: this });
            }
        });

        // Обработчик для завершения перетаскивания
        document.addEventListener("mouseup", (e) => {
            if (this.isDragging) {
                // Сбрасываем стили, когда отпущена кнопка мыши
                // clonedElement.style.position = "";
                // clonedElement.style.zIndex = "";
                clonedElement.remove();
                // console.log(clonedElement.originalElement);

                this.cardElement.style.opacity = "";

                this.isDragging = false;
                document.body.style.userSelect = ""; // Включаем выделение текста обратно
                document.body.style.overflow = "";
                this.triggerCustomEvent("card-mouseup", { event: e, cardModel: this });
            }
        });
    }

    deactivateDrag() {
        if (this.isCreatedCardElement) {
            const parentElem = this.cardElement.parentElement;
            this.cardElement.remove();
            this._cardElement = null;

            this.createHtmlShell();
            parentElem?.append(this.cardElement);
        }
    }

    isSelectionByOpponent() {
        if (
            this.isCreatedCardElement &&
            this.cardElement.classList.contains("game-card-activate-opponent")
        ) {
            return true;
        }

        return false;
    }

    enablesSelectionByOpponent() {
        if (
            this.isCreatedCardElement &&
            !this.cardElement.classList.contains("game-card-activate-opponent")
        ) {
            this.cardElement.classList.add("game-card-activate-opponent");
        }
    }

    deactivateSelectionByOpponent() {
        if (
            this.isCreatedCardElement &&
            this.cardElement.classList.contains("game-card-activate-opponent")
        ) {
            this.cardElement.classList.remove("game-card-activate-opponent");
        }
    }

    isSelection() {
        if (
            this.isCreatedCardElement &&
            this.cardElement.classList.contains("game-card-activate")
        ) {
            return true;
        }

        return false;
    }

    enablesSelection() {
        if (
            this.isCreatedCardElement &&
            !this.cardElement.classList.contains("game-card-activate")
        ) {
            this.cardElement.classList.add("game-card-activate");
        }
    }

    deactivateSelection() {
        if (
            this.isCreatedCardElement &&
            this.cardElement.classList.contains("game-card-activate")
        ) {
            this.cardElement.classList.remove("game-card-activate");
        }
    }

    toggleSelection() {
        if (this.isCreatedCardElement) {
            if (this.cardElement.classList.contains("game-card-activate")) {
                this.deactivateSelection(); // Выключаем, если включено
            } else {
                this.enablesSelection(); // Включаем, если выключено
            }
        }
    }

    createHtmlShell() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("game-card");
        cardElement.innerHTML = `
            <img src="${this.src}" alt="${this.cardId} image">
        `;

        this._cardElement = cardElement;

        // Инициализируем
        this.updateAttributesHtml();
        // this.enableDrag();

        // Настроим остальные слушатели (например, для hover)
        CardModel.setupCardHoverListeners(this);

        return this;
    }

    updateAttributesHtml() {
        if (this.cardElement instanceof HTMLElement) {
            // Удаляем атрибуты перед их обновлением
            this.cardElement.removeAttribute("data-card-id");
            this.cardElement.removeAttribute("data-card-type");
            this.cardElement.removeAttribute("data-card-owner-name");
            this.cardElement.removeAttribute("data-card-target-name");

            // Устанавливаем или обновляем остальные атрибуты
            this.cardElement.setAttribute("data-card-id", this.cardId);
            this.cardElement.setAttribute("data-card-type", this.cardType);

            if (this.ownerName.trim().length > 0) {
                this.cardElement.setAttribute("data-card-owner-name", this.ownerName);
            }

            if (this.targetName.trim().length > 0) {
                this.cardElement.setAttribute("data-card-target-name", this.targetName);
            }
        }
    }

    removeHtml() {
        if (this.cardElement) {
            this.cardElement.remove();
            this._cardElement = null;
        }
    }

    toJSON() {
        return {
            id: this._cardId,
            type: this._cardType,
            ownerName: this._ownerName,
            targetName: this._targetName,
            image: this._src,
        };
    }

    static setupCardHoverListeners(cardModel) {
        if (!(cardModel instanceof CardModel)) {
            console.error(
                "Параметр для метода CardModel::setupCardHoverListeners не является CardModel"
            );
        }

        const descriptionElement = document.querySelector(cardModel.selectorDescriptionCart);
        if (
            cardModel.cardElement instanceof HTMLElement &&
            descriptionElement instanceof HTMLElement
        ) {
            cardModel.cardElement.addEventListener("mouseenter", () => {
                cardModel.timerDescription = setTimeout(() => {
                    CardModel.showDescription(cardModel.cardElement, descriptionElement);
                }, cardModel.delayDescription); // Ждём 2 секунды
            });
            cardModel.cardElement.addEventListener("mouseleave", () => {
                clearTimeout(cardModel.timerDescription);
                CardModel.hideDescription(descriptionElement); // Убираем описание
            });
        } else {
            console.error("descriptionElement not found");
        }
    }

    static init(cardId, cardType, src, ownerName = "", targetName = "") {
        const cardModel = new CardModel(cardId, cardType, src, ownerName, targetName);
        return cardModel.createHtmlShell();
    }

    static showDescription(cardElement, descriptionElement) {
        const imageCard = cardElement?.querySelector("img");
        const imageDescription = descriptionElement?.querySelector("img");
        if (
            descriptionElement instanceof HTMLElement &&
            imageCard instanceof HTMLImageElement &&
            imageDescription instanceof HTMLImageElement
        ) {
            descriptionElement.style.display = "block";
            imageDescription.src = imageCard.src;
        }
    }

    static hideDescription(descriptionElement) {
        const imageDescription = descriptionElement.querySelector("img");
        if (descriptionElement instanceof HTMLElement) {
            descriptionElement.style.display = "none"; // Скрываем блок
            imageDescription.src = "";
        }
    }
}
