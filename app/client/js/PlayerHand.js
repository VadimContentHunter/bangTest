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

        this.mainPanel = this.mainElement?.querySelector(".main-panel");
        this.checkElements();
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            console.error("PlayerHand.name(value): value must be a non-empty string.");
            return;
            // throw new Error("PlayerHand.name(value): value must be a non-empty string.");
        }

        this._name = value;
    }

    set role(value) {
        this._role = value;
    }

    set character(value) {
        this._character = value;
    }

    set weapon(value) {
        this._weapon = value;
    }

    set lives(value) {
        if (!Number.isInteger(value) || value < 0) {
            console.error(
                "PlayerHand.lives(value): value must be an integer or value must be greater than zero"
            );
            return;
        }
        this._lives = value;
    }

    set maxLives(value) {
        if (!Number.isInteger(value) || value < 0) {
            console.error(
                "PlayerHand.maxLives(value): value must be an integer or value must be greater than zero."
            );
            return;
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
            console.error(
                "PlayerHand.lives(value): value must be an integer or value must be greater than zero "
            );
            return;
        }
        return this._lives;
    }

    get maxLives() {
        if (!Number.isInteger(this._maxLives) || this._maxLives < 0) {
            console.error(
                "PlayerHand.maxLives(value): value must be an integer or value must be greater than zero."
            );
            return;
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
        if (!(this.mainPanel instanceof HTMLElement)) {
            throw new Error("Invalid main panel selector");
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
