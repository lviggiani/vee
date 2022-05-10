function createElement(tagName, parent, properties = {}){
    return Object.assign(parent.appendChild(document.createElement(tagName)), properties);
}

export { createElement }