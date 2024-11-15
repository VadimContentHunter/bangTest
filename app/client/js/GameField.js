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
                if(iElement instanceof HTMLElement){
                    if(iElement.classList.contains("icon-collapse")){
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
}

class GameField {
    init() {
        this.playerHand = new PlayerHand("main .player-hand");
        this.playerHand.init();
    }
}

// const gameField = new GameField();
