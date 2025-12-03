class EUIButton extends HTMLElement {
    static observedAttributes = ["type", "width", "height", "border-radius", "icon"];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem 1rem;
                    font-size: 1rem;
                    font-weight: 600;
                    font-family: inherit;
                    border-radius: 0.6rem;
                    border: none;
                    background: var(--app-300);
                    color: var(--app-text, #FFF);
                    cursor: pointer;
                    box-sizing: border-box;

                    transition: background 0.2s cubic-bezier(.2,0,0,1);
                }

                button:hover {
                    background: var(--app-400);
                }

                button:active {
                    background: var(--app-300);
                }

                .light button {
                    background: var(--app-500);
                }

                button.filled {
                    background: var(--app-accent-100);
                    color: #fff;
                }

                button.filled:hover {
                    background: var(--app-accent-50);
                }

                button.filled:active {
                    background: var(--app-accent-200);
                }

                button.outlined {
                    background: transparent;
                    box-shadow: inset 0 0 0 2px var(--app-400);
                    color: var(--app-accent-100);
                }

                button.outlined:hover {
                    background: var(--app-300);
                }

                button.outlined:active {
                    background: var(--app-100);
                }

                button.icon {
                    padding: 0.5rem;
                    border-radius: 50%;
                }

                button.transparent {
                    background: transparent;
                    color: var(--app-text);

                    position: relative;
                }

                button.transparent:hover {
                    background: var(--app-300);
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

            </style>
            <button>
                <slot></slot>
            </button>
        `;
    }

    connectedCallback() {
        const button = this.shadowRoot.querySelector("button");

        if (this.hasAttribute("type")) button.classList.add(this.getAttribute("type"));
        if (this.hasAttribute("icon")) button.classList.add("icon");
        if (this.hasAttribute("width")) button.style.width = this.getAttribute("width") + "px";
        if (this.hasAttribute("height")) button.style.height = this.getAttribute("height") + "px";
        if (this.hasAttribute("border-radius")) button.style.borderRadius = this.getAttribute("border-radius") + "px";
    }
}

customElements.define("eui-button", EUIButton);