import { createElement } from "../dom/DOMUtils.js";

export default class TableView extends HTMLElement {
    #table;
    #data;

    constructor(){
        super();
        this.init();
    }

    init(){
        this.#table = createElement("table", this);
    }

    async attributeChangedCallback(name, oldValue, newValue){
        switch (name){
            case "columns": this.refresh(); break;
            case "src":
                if (!!newValue){
                    const response = await fetch(newValue, { 
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    });
                    this.#data = await response.json();
                } else {
                    this.#data = null;
                }
                this.refresh(); break;
        }
    }

    refresh(){
        this.#table.innerHTML = "";
        const header = createElement("tr", this.#table);
        this.columns.forEach(col => createElement("th", header, { textContent: col.split(/\s*:\s*/)[0] }));

        if (!this.#data) return;
        this.addData(this.#data);
        console.log(this.#data);
    }

    addData(data){
        if (Array.isArray(data)){
            return data.map(row => this.addData(row));
        } else {
            const tr = createElement("tr", this.#table);
            this.columns.forEach(col => {
                const key = col.split(/\s*:\s*/)[1] || col.split(/\s*:\s*/)[0];
                let value = data[key];

                const td = createElement("td", tr);

                if (Array.isArray(value)) {
                    const button = createElement("div", td, { className: "Toggle" });
                    button._rows = this.addData(value);
                    button.setAttribute("expanded", "");
                    button.addEventListener("click", e => this.toggleRows(e.target));
                    this.toggleRows(button)
                } else if (value){
                    createElement("span", td, { textContent: value.toLocaleString(), className: value ? key : ""});
                }
            });

            return tr;
        }
    }

    toggleRows(button){
        const expanded = button.hasAttribute("expanded");

        if (expanded){
            button.removeAttribute("expanded");
            button._rows.forEach(row => row.style.display = "none");
        } else {
            button.setAttribute("expanded", "");
            button._rows.forEach(row => row.style.display = "");
        }
    }

    get columns(){ return this.getAttribute("columns").split(/\s*,\s*/) }
    set columns(value) { this.setAttribute("columns", Array.isArray(value) ? value.join(",") : value) }

    get src(){ return this.getAttribute("src") }
    set src(value) { this.setAttribute("src", value) }

    static get observedAttributes(){ return ["columns", "src"]}
}

customElements.define("vee-table-view", TableView);

createElement("link", document.head, { rel: "stylesheet", type: "text/css", href: import.meta.url.replace(/\.js$/, ".css")});
