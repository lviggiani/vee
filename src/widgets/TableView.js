import { createElement } from "../dom/DOMUtils.js";

export default class TableView extends HTMLElement {
    constructor(){
        super();
    }
}

customElements.define("v-table-view", TableView);

createElement("link", document.head, { rel: "stylesheet", type: "text/css", href: import.meta.url.replace(/\.js$/, ".css")});
