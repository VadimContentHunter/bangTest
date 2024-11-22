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
    constructor(selectorMainElement, selectorCardsSelection) {
        super(selectorMainElement);

        this.cardsSelection = this.mainElement?.querySelector(selectorCardsSelection);
        this.collapseElement = this.cardsSelection?.querySelector(".icon-control-collapse");
        this.closeElement = this.cardsSelection?.querySelector(".icon-control-close");
        this.containerElement = this.cardsSelection?.querySelector(".cards-container");
        this.headerElement = this.cardsSelection?.querySelector(".header");
        this.textElement = this.mainElement?.querySelector(selectorCardsSelection + " > p");

        this.checkElements();
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
}
