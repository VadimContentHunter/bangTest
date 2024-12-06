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

    constructor(selectorMainElement, selectorCardsSelection) {
        super(selectorMainElement);

        this.cardsSelection = this.mainElement?.querySelector(selectorCardsSelection);
        this.collapseElement = this.cardsSelection?.querySelector(".icon-control-collapse");
        this.closeElement = this.cardsSelection?.querySelector(".icon-control-close");
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

    renderUpdatedData() {
        this.headerTitleElement.innerHTML = this.title;
        this.headerDescriptionElement.innerHTML = this.description;
        this.textElement.innerHTML = this.textExtension;
        this.timerValueElement.innerHTML = this.timer ?? "--";

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
        if (!(this.collapseElement instanceof HTMLElement)) {
            throw new Error("Invalid collapse card selection selector");
        }
        if (!(this.closeElement instanceof HTMLElement)) {
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

    setupDragCardListener() {
        this.containerCards.forEach((card, index) => {
            if (card instanceof CardModel && card.isCreatedCardElement()) {
                card.cardElement.addEventListener("click", (e) => {
                    this.hideMainController();
                    document.dispatchEvent(
                        new CustomEvent("sendServer", {
                            detail: {
                                data: card,
                                action: "playerSelectCard",
                            },
                        })
                    );
                });
            }
        });
    }
}
