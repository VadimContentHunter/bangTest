class GameBoard {
    _name = "Неизвестный Игрок";
    _numDistance = 0;
    _role = null;
    _character = null;
    _weapon = null;
    _lives = 0;
    _maxLives = 5;
    _countHandCards = 0;
    _tempCards = [];

    constructor() {
        this.mainElement = null;
        this.frontPanelElement = null;
        this.nameElement = null;
        this.countHandCardsElement = null;
        this.distanceNumElement = null;
        this.livesElement = null;
        this.infoElement = null;
        this.roleElement = null;
        this.characterElement = null;
        this.weaponElement = null;

        this.cardTempAreaElement = null;
        this.containerCardTempElement = null;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error("GameBoard.name(value): value must be a non-empty string.");
            // throw new Error("GameBoard.name(value): value must be a non-empty string.");
        }

        this._name = value;
    }

    set numDistance(value) {
        this._numDistance = value;
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
                "GameBoard.lives(value): value must be an integer or value must be greater than zero"
            );
        }
        this._lives = value;
    }

    set maxLives(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(
                "GameBoard.maxLives(value): value must be an integer or value must be greater than zero."
            );
        }
        this._maxLives = value;
    }

    set countHandCards(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(
                "GameBoard.countHandCards(value): value must be an integer or value must be greater than zero."
            );
        }
        this._countHandCards = value;
    }

    set tempCards(value) {
        if (!Array.isArray(value)) {
            throw new Error("GameBoard.tempCards(value): value must be an array.");
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

    get name() {
        if (typeof this._name !== "string" || this._name.trim() === "") {
            throw new Error("GameBoard.name(value): value must be a non-empty string.");
        }
        return this._name;
    }

    get numDistance() {
        if (!Number.isInteger(this._numDistance) || this._numDistance < 0) {
            throw new Error(
                "GameBoard.numDistance(value): value must be an integer or value must be greater than zero "
            );
        }
        return this._numDistance;
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
                "GameBoard.lives(value): value must be an integer or value must be greater than zero "
            );
        }
        return this._lives;
    }

    get maxLives() {
        if (!Number.isInteger(this._maxLives) || this._maxLives < 0) {
            throw new Error(
                "GameBoard.maxLives(value): value must be an integer or value must be greater than zero."
            );
        }
        return this._maxLives;
    }

    get countHandCards() {
        if (!Number.isInteger(this._countHandCards) || this._countHandCards < 0) {
            throw new Error(
                "GameBoard.countHandCards(value): value must be an integer or value must be greater than zero."
            );
        }
        return this._countHandCards;
    }

    get tempCards() {
        if (!Array.isArray(this._tempCards)) {
            throw new Error("GameBoard.tempCards(value): value must be an array.");
        }

        // Проверяем, что все элементы массива являются экземплярами CardModel
        if (!this._tempCards.every((card) => card instanceof CardModel)) {
            throw new Error(
                "GameBoard.tempCards: all elements of _tempCards must be instances of CardModel."
            );
        }

        return this._tempCards;
    }

    checkElements() {
        if (!(this.mainElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid main element selector");
        }
        if (!(this.frontPanelElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid front panel element selector");
        }
        if (!(this.nameElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid name element selector");
        }
        if (!(this.countHandCardsElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid count hand cards element selector");
        }
        if (!(this.distanceNumElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid distance num element selector");
        }
        if (!(this.livesElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid lives element selector");
        }
        if (!(this.infoElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid info element selector");
        }
        if (!(this.roleElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid role element selector");
        }
    }

    checkCardTempAreaElements() {
        if (!(this.cardTempAreaElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid card temp area element selector");
        }
        if (!(this.containerCardTempElement instanceof HTMLElement)) {
            throw new Error("GameBoard: Invalid container card temp element selector");
        }
    }

    initAndCreateToContainer(selectorOrElement) {
        this.createGameBoard();
        this.createCardTempArea();
        this.initToContainer(selectorOrElement);
    }

    initToContainer(selector) {
        this.checkElements();
        this.checkCardTempAreaElements();

        const container =
            selector instanceof HTMLElement ? selector : document.querySelector(selector);
        if (!(container instanceof HTMLElement)) {
            throw new Error("GameBoard.initToContainer(selector): Invalid container selector");
        }
        container.append(this.mainElement);
        container.append(this.cardTempAreaElement);
    }

    createGameBoard() {
        this.mainElement = document.createElement("section");
        this.mainElement.classList.add("game-board");

        //----------------------------------------------------------------
        this.frontPanelElement = document.createElement("div");
        this.frontPanelElement.classList.add("front-panel");

        this.nameElement = document.createElement("div");
        this.nameElement.classList.add("player-name");
        this.frontPanelElement.append(this.nameElement);

        const countElement = document.createElement("div");
        countElement.classList.add("icon-control", "icon-all-cards");
        countElement.innerHTML = `
            <i class="icon-cards"></i>
            <div class="item-value">0</div>
        `;
        this.frontPanelElement.append(countElement);

        const distanceElement = document.createElement("div");
        distanceElement.classList.add("icon-control", "icon-range");
        distanceElement.innerHTML = `
            <i class="icon-target"></i>
            <div class="item-value">0</div>
        `;
        this.frontPanelElement.append(distanceElement);

        this.mainElement.append(this.frontPanelElement);

        this.countHandCardsElement = countElement.querySelector(".item-value");
        this.distanceNumElement = distanceElement.querySelector(".item-value");
        //----------------------------------------------------------------
        this.livesElement = document.createElement("div");
        this.livesElement.classList.add("lives");
        this.mainElement.append(this.livesElement);

        //----------------------------------------------------------------
        this.infoElement = document.createElement("div");
        this.infoElement.classList.add("info");

        this.roleElement = document.createElement("div");
        this.roleElement.classList.add("role");
        this.infoElement.append(this.roleElement);

        this.characterElement = document.createElement("div");
        this.characterElement.classList.add("character");
        this.infoElement.append(this.characterElement);

        this.weaponElement = document.createElement("div");
        this.weaponElement.classList.add("weapon");
        this.infoElement.append(this.weaponElement);

        this.mainElement.append(this.infoElement);

        this.checkElements();
        this.setupDragCardListener();
    }

    createCardTempArea() {
        this.cardTempAreaElement = document.createElement("section");
        this.cardTempAreaElement.classList.add("card-temp-area");

        this.containerCardTempElement = document.createElement("div");
        this.containerCardTempElement.classList.add("cards-container");
        this.cardTempAreaElement.append(this.containerCardTempElement);

        this.checkCardTempAreaElements();
    }

    renderUpdatedData() {
        this.nameElement.innerText = this.name;
        this.livesElement.innerHTML = "";
        for (let i = 0; i < this.maxLives; i++) {
            if (this.lives > i) {
                this.livesElement.innerHTML += `
                    <div class="icon-live-bullet">
                        <i class="icon-bullet"></i>
                    </div>
                `;
            } else {
                this.livesElement.innerHTML += `
                    <div class="icon-live-bullet-not">
                        <i class="icon-bullet-full-fill"></i>
                    </div>
                `;
            }
        }
        this.countHandCardsElement.innerText = this.countHandCards;
        this.distanceNumElement.innerText = this.numDistance;

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
    }

    renderUpdatedTempCards() {
        this.tempCards.forEach((tempCard) => {
            if (!(tempCard instanceof CardModel)) {
                console.error("renderUpdatedTempCards: tempCard is not an instance of CardModel.");
                return;
            }

            const cardElem = tempCard.createHtmlShell()?.cardElement;
            if (cardElem instanceof HTMLElement) {
                this.containerCardTempElement.append(cardElem); // Добавляем элемент в контейнер
            } else {
                console.error("renderUpdatedTempCards: cardElem is not a valid HTMLElement.");
            }
        });
    }

    destroy() {
        // Удаляем ссылки на элементы
        this.mainElement?.remove();
        this.cardTempAreaElement?.remove();
        this.mainElement = null;
        this.frontPanelElement = null;
        this.nameElement = null;
        this.countHandCardsElement = null;
        this.distanceNumElement = null;
        this.livesElement = null;
        this.infoElement = null;
        this.roleElement = null;
        this.characterElement = null;
        this.weaponElement = null;
        this.cardTempAreaElement = null;
        this.containerCardTempElement = null;
    }

    setupDragCardListener(playerHand) {
        requestAnimationFrame(() => {
            if (playerHand instanceof PlayerHand) {
                // Создаем переменную для хранения rect
                let rect = this.mainElement.getBoundingClientRect();
                let hasActivated = false;

                // Обновляем rect при изменении размера окна
                window.addEventListener("resize", () => {
                    rect = this.mainElement.getBoundingClientRect();
                });

                // Обработчик мыши
                document.addEventListener("mousemove", (e) => {
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    // Проверяем, находится ли мышь внутри прямоугольника
                    if (
                        playerHand.selectCard instanceof CardModel &&
                        mouseX >= rect.left &&
                        mouseX <= rect.right &&
                        mouseY >= rect.top &&
                        mouseY <= rect.bottom
                    ) {
                        if (!this.mainElement.classList.contains("hover-card")) {
                            this.mainElement.classList.add("hover-card");
                        }

                        if (!hasActivated) {
                            hasActivated = true;
                            playerHand.selectCard.targetName = this.name;
                            playerHand.selectCard.updateAttributesHtml();
                        }
                    } else {
                        hasActivated = false;
                        this.mainElement.classList.remove("hover-card");
                    }
                });
            }
        });
    }
}
