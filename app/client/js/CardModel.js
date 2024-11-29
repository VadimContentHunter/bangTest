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
        DEFAULT: "default",
    };

    _cardId = null;
    _cardType = null;
    // _ownerName = null;
    _src = null;
    _timerDescription = {};
    _cardElement = null;
    _selectorDescriptionCart = null;

    constructor(cardId, cardType, src) {
        this.cardId = cardId;
        this.cardType = cardType;
        // this.ownerName = ownerName;
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

    // set ownerName(value) {
    //     if (typeof value !== "string" || value.trim() === "") {
    //         throw new CardModelError("ownerName must be a non-empty string.");
    //     }
    //     this._ownerName = value;
    // }

    set timerDescription(value) {
        this._timerDescription = value;
    }

    set selectorDescriptionCart(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new CardModelError("ownerName must be a non-empty string.");
        }
        this._selectorDescriptionCart = value;
    }

    get cardId() {
        return this._cardId;
    }

    get cardType() {
        return this._cardType;
    }

    // get ownerName() {
    //     return this._ownerName;
    // }

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
        return 2000;
    }

    get selectorDescriptionCart() {
        return this._selectorDescriptionCart;
    }

    isCreatedCardElement() {
        return this._cardElement instanceof HTMLElement;
    }

    // Метод для инициализации перетаскивания
    enableDrag() {
        if (!this.cardElement) return;

        let isDragging = false;
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

            isDragging = true;
            document.body.style.userSelect = "none"; // Отключаем выделение текста во время перетаскивания
        });

        // Обработчик для перемещения блока
        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                // Устанавливаем новые координаты для блока
                clonedElement.style.left = `${x}px`;
                clonedElement.style.top = `${y}px`;
            }
        });

        // Обработчик для завершения перетаскивания
        document.addEventListener("mouseup", () => {
            if (isDragging) {
                // Сбрасываем стили, когда отпускана кнопка мыши
                // clonedElement.style.position = "";
                // clonedElement.style.zIndex = "";
                clonedElement.remove();
                // console.log(clonedElement.originalElement);
                
                this.cardElement.style.opacity = "";
                

                isDragging = false;
                document.body.style.userSelect = ""; // Включаем выделение текста обратно
            }
        });
    }

    createHtmlShell() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("game-card");
        cardElement.innerHTML = `
            <img src="${this.src}" alt="${this.cardId} image">
        `;
        cardElement.setAttribute("data-card-id", this._cardId);
        cardElement.setAttribute("data-card-type", this._cardType);

        // Инициализируем перетаскивание
        this._cardElement = cardElement;

        // Инициализируем перетаскивание
        this.enableDrag();

        // Настроим остальные слушатели (например, для hover)
        CardModel.setupCardHoverListeners(this);

        return this;
    }

    removeHtml() {
        if (this.cardElement) {
            this.cardElement.remove();
            this.cardElement = null;
        }
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

    static init(cardId, cardType, src) {
        const cardModel = new CardModel(cardId, cardType, src);
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
