class CardModel {
    static CardTypes = {
        ROLE: "role",
        CHARACTER: "character",
        WEAPON: "weapon",
        HAND: "hand",
    };

    _cardId = null;
    _cardType = null;
    _ownerName = null;
    _src = null;
    _timerDescription = {};
    _cartElement = null;
    _selectorDescriptionCart = null;

    constructor(cardId, cardType, ownerName, src) {
        this.cardId = cardId; // Используем сеттер для проверки
        this.cardType = cardType; // Используем сеттер для проверки
        this.ownerName = ownerName; // Используем сеттер для проверки
        this._src = src;
        this.selectorDescriptionCart = ".card-description";
    }

    set cardId(value) {
        if (!Number.isInteger(value)) {
            throw new Error("cardId must be an integer.");
        }
        this._cardId = value;
    }

    set cardType(value) {
        if (!Object.values(CardModel.CardTypes).includes(value)) {
            throw new Error(
                `cardType must be one of: ${Object.values(CardModel.CardTypes).join(", ")}`
            );
        }
        this._cardType = value;
    }

    set ownerName(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error("ownerName must be a non-empty string.");
        }
        this._ownerName = value;
    }

    set timerDescription(value) {
        this._timerDescription = value;
    }

    set selectorDescriptionCart(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error("ownerName must be a non-empty string.");
        }
        this._selectorDescriptionCart = value;
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

    get timerDescription() {
        return this._timerDescription;
    }

    get src() {
        return this._src;
    }

    get cartElement() {
        return this._cartElement;
    }

    get delayDescription() {
        return 2000;
    }

    get selectorDescriptionCart() {
        return this._selectorDescriptionCart;
    }

    isCreatedCartElement() {
        return this._cartElement instanceof HTMLElement;
    }

    createHtmlShell() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("game-card");
        cardElement.innerHTML = `
            <img src="${this.src}" alt="${this.cardId} image">
        `;
        // Установка атрибутов
        cardElement.setAttribute("data-card-id", this._cardId);
        cardElement.setAttribute("data-card-type", this._cardType);

        this.setupCardHoverListeners(cardElement);
        this._cartElement = cardElement;
        return this;
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
        }
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
