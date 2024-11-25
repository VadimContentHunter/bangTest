class PlayerHand {
    _name = "Игрок";
    _role = null;
    _character = null;
    _weapon = null;
    _lives = 0;
    _maxLives = 5;
    _handCards = [];
    _tempCards = [];

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

        this.mainPanelElement = this.mainElement?.querySelector(".main-panel");
        this.cardsInfoElement = this.mainPanelElement?.querySelector(".cards-info");
        this.roleElement = this.cardsInfoElement?.querySelector(".role");
        this.characterElement = this.cardsInfoElement?.querySelector(".character");
        this.weaponElement = this.cardsInfoElement?.querySelector(".weapon");
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
            value = CardModel.init(value?.id, value?.type, value?.image);
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
            value = CardModel.init(value?.id, value?.type, value?.image);
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
            value = CardModel.init(value?.id, value?.type, value?.image);
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

    set handCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("PlayerHand.handCards(value): value must be an array.");
        }
        this._handCards = value;
    }

    set tempCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("PlayerHand.tempCards(value): value must be an array.");
        }
        this._tempCards = value;
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

    get handCards() {
        if (!Array.isArray(this._handCards)) {
            throw new Error("PlayerHand.handCards(value): value must be an array.");
        }
        return this._handCards;
    }

    get tempCards() {
        if (!Array.isArray(this._tempCards)) {
            throw new Error("PlayerHand.tempCards(value): value must be an array.");
        }
        return this._tempCards;
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
    }

    init() {
        this.setupFoldListener();
        this.setupCollapseListener();
        this.setupFullscreenListener();
    }

    renderUpdatedData() {
        this.playerNameElement.innerText = this.name;
        this.playerLivesElement.innerHTML = "";
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
        if(this.role instanceof CardModel){
            this.roleElement.append(this.role.cartElement);
        }
        if (this.character instanceof CardModel) {
            this.characterElement.append(this.character.cartElement);
        }
        if (this.weapon instanceof CardModel) {
            this.weaponElement.append(this.weapon.cartElement);
        }
        // this.
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
