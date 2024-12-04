class PlayerHand {
    _name = "Игрок";
    _role = null;
    _character = null;
    _weapon = null;
    _lives = 0;
    _maxLives = 5;
    _quantityAllHandCards = 0;
    _handCards = [];
    _tempCards = [];
    _selectCard = null;

    constructor(selectorMainElement) {
        this.mainElement = document.querySelector(selectorMainElement);
        this.allCardsElement = this.mainElement?.querySelector(
            ".front-panel .player-controls .icon-all-cards"
        );

        this.allCardsValueElement = this.allCardsElement.querySelector(".item-value");

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

        this.mainPanelElement = this.mainElement?.querySelector(".main-panel");

        this.cardsInfoElement = this.mainPanelElement?.querySelector(".cards-info");
        this.roleElement = this.cardsInfoElement?.querySelector(".role");
        this.characterElement = this.cardsInfoElement?.querySelector(".character");
        this.weaponElement = this.cardsInfoElement?.querySelector(".weapon");

        this.cardsTempElement = this.mainPanelElement?.querySelector(".cards-temp");
        this.cardsHandElement = this.mainPanelElement?.querySelector(".cards-hand");

        this.checkElements();
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error("PlayerHand.name(value): value must be a non-empty string.");
        }

        this._name = value;
    }

    /**
     * Устанавливает роль для руки игрока.
     * Если переданное значение не является экземпляром `CardModel`,
     * метод пытается инициализировать его с помощью `CardModel.init`.
     * Выбрасывает ошибку, если значение не удаётся преобразовать в допустимый `CardModel`.
     *
     * @param {CardModel|Object|null} value - Устанавливаемая роль. Может быть экземпляром `CardModel`
     *                                   или объектом, который можно преобразовать в `CardModel`.
     * @throws {Error} Выбрасывается, если значение не является экземпляром `CardModel` после преобразования.
     */
    set role(value) {
        if (!(value instanceof CardModel)) {
            value = CardModel.init(value?.id, value?.type, value?.image, this.name);
        }

        if (!(value instanceof CardModel)) {
            throw new Error("PlayerHand.role(value): value must be an instance of CardModel.");
        }
        this._role = value;
    }

    /**
     * Устанавливает персонажа для руки игрока.
     * Проверяет, является ли переданное значение экземпляром `CardModel`.
     * Если нет, пытается инициализировать его через `CardModel.init(value)`.
     *
     * @param {Object} value - Устанавливаемое значение персонажа.
     *                        Ожидается объект, который может быть инициализирован как `CardModel`.
     * @throws {Error} Если значение не является экземпляром `CardModel` после инициализации.
     */
    set character(value) {
        // Если значение не является экземпляром CardModel, пытаемся инициализировать
        if (!(value instanceof CardModel)) {
            value = CardModel.init(value?.id, value?.type, value?.image, this.name);
        }

        // Если значение не является экземпляром CardModel даже после инициализации, выбрасываем ошибку
        if (!(value instanceof CardModel)) {
            throw new Error("PlayerHand.character(value): value must be an instance of CardModel.");
        }

        this._character = value;
    }

    /**
     * Устанавливает оружие для руки игрока.
     * Проверяет, является ли переданное значение экземпляром `CardModel`.
     * Если нет, пытается инициализировать его через `CardModel.init(value)`.
     *
     * @param {Object} value - Устанавливаемое значение оружия.
     *                        Ожидается объект, который может быть инициализирован как `CardModel`.
     * @throws {Error} Если значение не является экземпляром `CardModel` после инициализации.
     */
    set weapon(value) {
        // Если значение не является экземпляром CardModel, пытаемся инициализировать
        if (!(value instanceof CardModel)) {
            value = CardModel.init(value?.id, value?.type, value?.image, this.name);
        }

        // Если значение не является экземпляром CardModel даже после инициализации, выбрасываем ошибку
        if (!(value instanceof CardModel)) {
            throw new Error("PlayerHand.weapon(value): value must be an instance of CardModel.");
        }

        this._weapon = value;
    }

    set lives(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(
                "PlayerHand.lives(value): value must be an integer or value must be greater than zero"
            );
        }
        this._lives = value;
    }

    set maxLives(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(
                "PlayerHand.maxLives(value): value must be an integer or value must be greater than zero."
            );
        }
        this._maxLives = value;
    }

    set quantityAllHandCards(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(
                "PlayerHand.quantityAllHandCards(value): value must be an integer or value must be greater than zero"
            );
        }
        this._quantityAllHandCards = value;
    }

    set handCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("PlayerHand.handCards(value): value must be an array.");
        }

        // Преобразуем массив и фильтруем только корректные данные
        this._handCards = value
            .map((data) => {
                try {
                    // console.log(this.name);

                    return CardModel.init(data?.id, data?.type, data?.image, this.name);
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

    set tempCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("PlayerHand.tempCards(value): value must be an array.");
        }

        // Преобразуем массив и фильтруем только корректные данные
        this._tempCards = value
            .map((data) => {
                try {
                    return CardModel.init(data?.id, data?.type, data?.image, this.name);
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
     * @param {CardModel} value
     */
    set selectCard(value) {
        if (!(value instanceof CardModel)) {
            throw new Error(
                "PlayerHand.selectCard(value): value must be an instance of CardModel."
            );
        }
        this._selectCard = value;
    }

    get name() {
        if (typeof this._name !== "string" || this._name.trim() === "") {
            throw new Error("PlayerHand.name(value): value must be a non-empty string.");
        }
        return this._name;
    }

    get role() {
        return this._role;
    }

    get character() {
        return this._character;
    }

    get weapon() {
        return this._weapon;
    }

    get lives() {
        if (!Number.isInteger(this._lives) || this._lives < 0) {
            throw new Error(
                "PlayerHand.lives(value): value must be an integer or value must be greater than zero "
            );
        }
        return this._lives;
    }

    get maxLives() {
        if (!Number.isInteger(this._maxLives) || this._maxLives < 0) {
            throw new Error(
                "PlayerHand.maxLives(value): value must be an integer or value must be greater than zero."
            );
        }
        return this._maxLives;
    }

    get quantityAllHandCards() {
        if (!Number.isInteger(this._quantityAllHandCards) || this._quantityAllHandCards < 0) {
            throw new Error(
                "PlayerHand.quantityAllHandCards(value): value must be an integer or value must be greater than zero."
            );
        }
        return this._quantityAllHandCards;
    }

    get handCards() {
        if (!Array.isArray(this._handCards)) {
            throw new Error("PlayerHand.handCards(value): value must be an array.");
        }

        // Проверяем, что все элементы массива являются экземплярами CardModel
        if (!this._handCards.every((card) => card instanceof CardModel)) {
            throw new Error(
                "PlayerHand.handCards: all elements of _handCards must be instances of CardModel."
            );
        }

        return this._handCards;
    }

    get tempCards() {
        if (!Array.isArray(this._tempCards)) {
            throw new Error("PlayerHand.tempCards(value): value must be an array.");
        }

        // Проверяем, что все элементы массива являются экземплярами CardModel
        if (!this._tempCards.every((card) => card instanceof CardModel)) {
            throw new Error(
                "PlayerHand.tempCards: all elements of _tempCards must be instances of CardModel."
            );
        }

        return this._tempCards;
    }

    get selectCard() {
        return this._selectCard;
    }

    resetSelectCard() {
        this._selectCard = null;
    }

    checkElements() {
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("Invalid main element selector");
        }
        if (!(this.allCardsElement instanceof HTMLElement)) {
            throw new Error("Invalid all cards element selector");
        }
        if (!(this.allCardsValueElement instanceof HTMLElement)) {
            throw new Error("Invalid all cards value selector");
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
        if (!(this.mainPanelElement instanceof HTMLElement)) {
            throw new Error("Invalid main panel selector");
        }
        if (!(this.cardsInfoElement instanceof HTMLElement)) {
            throw new Error("Invalid cards Info element selector");
        }
        if (!(this.roleElement instanceof HTMLElement)) {
            throw new Error("Invalid role element selector");
        }
        if (!(this.characterElement instanceof HTMLElement)) {
            throw new Error("Invalid character element selector");
        }
        if (!(this.weaponElement instanceof HTMLElement)) {
            throw new Error("Invalid weapon element selector");
        }
        if (!(this.cardsTempElement instanceof HTMLElement)) {
            throw new Error("Invalid cards temp element selector");
        }
        if (!(this.cardsHandElement instanceof HTMLElement)) {
            throw new Error("Invalid cards hand element selector");
        }
    }

    init() {
        this.setupFoldListener();
        this.setupCollapseListener();
        this.setupFullscreenListener();
    }

    renderUpdatedData() {
        this.playerNameElement.innerText = this.name;
        this.playerLivesElement.innerHTML = "";
        this.allCardsValueElement.innerText = this.quantityAllHandCards;

        for (let i = 0; i < this.maxLives; i++) {
            if (this.lives > i) {
                this.playerLivesElement.innerHTML += `
                    <div class="icon-live-bullet">
                        <i class="icon-bullet"></i>
                    </div>
                `;
            } else {
                this.playerLivesElement.innerHTML += `
                    <div class="icon-live-bullet-not">
                        <i class="icon-bullet-full-fill"></i>
                    </div>
                `;
            }
        }
        if (this.role instanceof CardModel) {
            this.roleElement.append(this.role.cardElement);
        }
        if (this.character instanceof CardModel) {
            this.characterElement.append(this.character.cardElement);
        }
        if (this.weapon instanceof CardModel) {
            this.weaponElement.append(this.weapon.cardElement);
        }

        this.renderUpdatedTempCards();
        this.renderUpdatedHandCards();
    }

    renderUpdatedTempCards() {
        this.tempCards.forEach((tempCard) => {
            if (!(tempCard instanceof CardModel)) {
                console.error(
                    "PlayerHand.renderUpdatedTempCards: tempCard is not an instance of CardModel."
                );
                return;
            }

            const cardElem = tempCard.createHtmlShell()?.cardElement;
            // tempCard.enableDrag({
            //     mousedownCallBack: (card, eventMouse) => {
            //         if (card instanceof CardModel && card.isDragging === true) {
            //             this.selectCard = card;
            //         }
            //     },
            //     mouseupCallBack: (card, eventMouse) => {
            //         if (card instanceof CardModel) {
            //             this.resetSelectCard();
            //         }

            //     },
            // });
            if (cardElem instanceof HTMLElement) {
                this.cardsTempElement.append(cardElem); // Добавляем элемент в контейнер
            } else {
                console.error(
                    "PlayerHand.renderUpdatedTempCards: cardElem is not a valid HTMLElement."
                );
            }
        });
    }

    renderUpdatedHandCards() {
        this.handCards.forEach((handCard) => {
            if (!(handCard instanceof CardModel)) {
                console.error(
                    "PlayerHand.renderUpdatedTempCards: tempCard is not an instance of CardModel."
                );
                return;
            }

            const cardElem = handCard.createHtmlShell()?.cardElement;
            handCard.enableDrag();
            handCard.cardElement.addEventListener("card-mousedown", (e) => {
                const { cardModel, mouseEvent } = e.detail;
                if (cardModel instanceof CardModel && cardModel.isDragging === true) {
                    this.selectCard = cardModel;
                }
            });
            handCard.cardElement.addEventListener("card-mouseup", (e) => {
                const { cardModel, mouseEvent } = e.detail;
                if (cardModel instanceof CardModel) {
                    cardModel.targetName = "";
                    cardModel.updateAttributesHtml();
                    this.resetSelectCard();
                }
            });
            if (cardElem instanceof HTMLElement) {
                this.cardsHandElement.append(cardElem); // Добавляем элемент в контейнер
            } else {
                console.error(
                    "PlayerHand.renderUpdatedHandCards: cardElem is not a valid HTMLElement."
                );
            }
        });
    }

    setupFoldListener() {
        this.foldElement.addEventListener("click", () => {
            if (this.mainPanelElement.style.display !== "none") {
                this.mainPanelElement.style.display = "none";
                this.foldElement.style.rotate = "180deg";
            } else {
                this.mainPanelElement.style.display = "";
                this.foldElement.style.rotate = "";
            }
        });
    }

    setupCollapseListener() {
        let iElement = this.collapseElement?.querySelector("i");

        this.collapseElement.addEventListener("click", () => {
            if (this.mainPanelElement.style.maxHeight == "") {
                this.mainPanelElement.style.maxHeight = "140px";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-collapse")) {
                        iElement.classList.remove("icon-collapse");
                        iElement.classList.add("icon-expand");
                    }
                }
            } else {
                this.mainPanelElement.style.maxHeight = "";
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
            if (this.mainPanelElement.style.maxHeight !== "none") {
                this.mainPanelElement.style.maxHeight = "none";
                if (iElement instanceof HTMLElement) {
                    if (iElement.classList.contains("icon-fullscreen")) {
                        iElement.classList.remove("icon-fullscreen");
                        iElement.classList.add("icon-fullscreen-exit");
                    }
                }
            } else {
                this.mainPanelElement.style.maxHeight = "";
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
