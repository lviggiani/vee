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

    addData(data, name = ""){
        if (Array.isArray(data)){
            return data.map(row => this.addData(row, name));
        } else {
            const tr = createElement("tr", this.#table);
            this.columns.forEach(col => {
                let key = col.split(/\s*:\s*/)[1] || col.split(/\s*:\s*/)[0];
                let cls = "";

                if (!!name && key.indexOf(".") != -1){
                    cls = key.split(".")[0];
                    key = (cls == name) ? key.split(".")[1] : "";
                }
                let value = data[key];

                const td = createElement("td", tr);

                if (Array.isArray(value)) {
                    const button = createElement("div", td, { className: "Toggle" });
                    button._rows = this.addData(value, key);
                    button.setAttribute("expanded", "");
                    button.addEventListener("click", e => this.toggleRows(e.target));
                    this.toggleRows(button)
                } else if (value && cls == name){
                    const format = this.formats.find(item => item.indexOf(name ? `${name}.${key}:` : `${key}:`) == 0);
                    if (format)
                        value = this.formatValue(value, format.split(":")[1]);

                    createElement("span", td, { textContent: value.toLocaleString(), className: value ? key : ""});
                }
            });

            return tr;
        }
    }

    formatValue(value, format){
        console.log(value);
        switch(format){
            case "percent": return `${(value * 100).toFixed(2)}%`;
            default: return value;
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

    get formats(){ return this.getAttribute("formats").split(/\s*,\s*/) }
    set formats(value) { this.setAttribute("formats", Array.isArray(value) ? value.join(",") : value) }

    get src(){ return this.getAttribute("src") }
    set src(value) { this.setAttribute("src", value) }

    static get observedAttributes(){ return ["columns", "src", "formats"]}
}

customElements.define("vee-table-view", TableView);

createElement("link", document.head, { rel: "stylesheet", type: "text/css", href: import.meta.url.replace(/\.js$/, ".css")});
