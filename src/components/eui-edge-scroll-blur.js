class EUIEdgeScrollBlur extends HTMLElement {
    static get observedAttributes() {
        return ['type'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
            .edge-scroll-effect-soft {
                position: absolute;
                left: 0;
                bottom: 0;
                right: 0;
                width: 100%;
                height: 81px;
                pointer-events: none;
                z-index: -1;
            }
            .edge-scroll-effect-soft>.blur-filter {
                position:absolute;
                inset:0
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(1) {
                backdrop-filter:blur(1px);
                -webkit-backdrop-filter:blur(1px);
                mask:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,1) 10%,rgba(0,0,0,1) 30%,rgba(0,0,0,0) 40%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(2) {
                backdrop-filter:blur(2px);
                -webkit-backdrop-filter:blur(2px);
                mask:linear-gradient(rgba(0,0,0,0) 10%,rgba(0,0,0,1) 20%,rgba(0,0,0,1) 40%,rgba(0,0,0,0) 50%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(3) {
                backdrop-filter:blur(2px);
                -webkit-backdrop-filter:blur(2px);
                mask:linear-gradient(rgba(0,0,0,0) 15%,rgba(0,0,0,1) 30%,rgba(0,0,0,1) 50%,rgba(0,0,0,0) 60%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(4) {
                backdrop-filter:blur(2px);
                -webkit-backdrop-filter:blur(2px);
                mask:linear-gradient(rgba(0,0,0,0) 20%,rgba(0,0,0,1) 40%,rgba(0,0,0,1) 60%,rgba(0,0,0,0) 70%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(5) {
                backdrop-filter:blur(2px);
                -webkit-backdrop-filter:blur(2px);
                mask:linear-gradient(rgba(0,0,0,0) 40%,rgba(0,0,0,1) 60%,rgba(0,0,0,1) 80%,rgba(0,0,0,0) 90%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(6) {
                backdrop-filter:blur(2px);
                -webkit-backdrop-filter:blur(2px);
                mask:linear-gradient(rgba(0,0,0,0) 60%,rgba(0,0,0,1) 80%)
            }
            .edge-scroll-effect-soft>.blur-filter:nth-child(7) {
                z-index:10;
                backdrop-filter:blur(4px);
                -webkit-backdrop-filter:blur(4px);
                mask:linear-gradient(rgba(0,0,0,0) 70%,rgba(0,0,0,1) 100%)
            }
            .edge-scroll-effect-soft>.gradient {
                position:absolute;
                inset:0;
                z-index:11;
                transition: background 0.2s var(--transition-function);
                background: var(--edge-gradient, linear-gradient(transparent 0%, var(--app-100, #000) 100%));
                opacity:.8
            }

            .edge-scroll-effect-soft.top {
                transform: rotate(180deg);
                top: 0;
                bottom: unset;
            }
            </style>
            <div class="edge-scroll-effect-soft">
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="blur-filter"></div>
                <div class="gradient"></div>
            </div>
        `;
    }

    connectedCallback() {
        const e = this.shadowRoot.querySelector('.edge-scroll-effect-soft');

        if (this.hasAttribute('type')) e.classList.add(this.getAttribute('type'));
    }
}

customElements.define('eui-edge-scroll-blur', EUIEdgeScrollBlur);