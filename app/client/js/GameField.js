class PlayerHand {
    constructor(selectorMainElement) {
        this.mainElement = document.querySelector(selectorMainElement);
        this.allCardsElement = this.mainElement?.querySelector(
            ".front-panel .player-controls .icon-all-cards"
        );

        this.foldElement = this.mainElement?.querySelector(
            ".front-panel .player-controls .icon-control-fold"
        );
        this.collapseElement = this.mainElement?.querySelector(
            ".front-panel .player-controls .icon-control-collapse"
        );
        this.fullscreenElement = this.mainElement?.querySelector(
            ".front-panel .player-controls .icon-control-fullscreen"
        );
        this.playerNameElement = this.mainElement?.querySelector(".front-panel .player-name");
        this.playerLivesElement = this.mainElement?.querySelector(".front-panel .player-lives");

        this.mainPanel = this.mainElement?.querySelector(".main-panel");

        this.checkElements();
    }

    checkElements() {
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("Invalid main element selector");
        }
        if (!(this.allCardsElement instanceof HTMLElement)) {
            throw new Error("Invalid all cards element selector");
        }
        if (!(this.foldElement instanceof HTMLElement)) {
            throw new Error("Invalid fold element selector");
        }
        if (!(this.collapseElement instanceof HTMLElement)) {
            throw new Error("Invalid collapse element selector");
        }
        if (!(this.fullscreenElement instanceof HTMLElement)) {
            throw new Error("Invalid expand element selector");
        }
        if (!(this.playerNameElement instanceof HTMLElement)) {
            throw new Error("Invalid player name element selector");
        }
        if (!(this.playerLivesElement instanceof HTMLElement)) {
            throw new Error("Invalid player lives element selector");
        }
        if (!(this.mainPanel instanceof HTMLElement)) {
            throw new Error("Invalid main panel selector");
        }
    }

    init() {
        this.setupFoldListener();
        this.setupCollapseListener();
        this.setupFullscreenListener();
    }

    setupFoldListener() {
        this.foldElement.addEventListener("click", () => {
            if (this.mainPanel.style.display !== "none") {
                this.mainPanel.style.display = "none";
                this.foldElement.style.rotate = "180deg";
            } else {
                this.mainPanel.style.display = "";
                this.foldElement.style.rotate = "";
            }
        });
    }

    setupCollapseListener() {
        let iElement = this.collapseElement?.querySelector("i");

        this.collapseElement.addEventListener("click", () => {
            if (this.mainPanel.style.maxHeight == "") {
                this.mainPanel.style.maxHeight = "140px";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-collapse")) {
                        iElement.classList.remove("icon-collapse");
                        iElement.classList.add("icon-expand");
                    }
                }
            } else {
                this.mainPanel.style.maxHeight = "";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-expand")) {
                        iElement.classList.remove("icon-expand");
                        iElement.classList.add("icon-collapse");
                    }
                }
            }
        });
    }

    setupFullscreenListener() {
        let iElement = this.fullscreenElement?.querySelector("i");

        this.fullscreenElement.addEventListener("click", () => {
            if (this.mainPanel.style.maxHeight !== "none") {
                this.mainPanel.style.maxHeight = "none";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-fullscreen")) {
                        iElement.classList.remove("icon-fullscreen");
                        iElement.classList.add("icon-fullscreen-exit");
                    }
                }
            } else {
                this.mainPanel.style.maxHeight = "";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-fullscreen-exit")) {
                        iElement.classList.remove("icon-fullscreen-exit");
                        iElement.classList.add("icon-fullscreen");
                    }
                }
            }
        });
    }
}

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

class GameField {
    init() {
        this.playerHand = new PlayerHand("main .player-hand");
        this.playerHand.init();

        // this.cards = new CardsHandler(".card-description");
        // this.cards.initializeAllHtmlCards(".game-card");
    }
}

// const gameField = new GameField();
