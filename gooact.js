/* Gooact by SweetPalma, 2018. All rights reserved. */
(() => { 'use strict';

const createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return {type, props, children};
};

const setAttribute = (dom, key, value) => {
    if (typeof value == 'function' && key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        dom.__gooactHandlers = dom.__gooactHandlers || {};
        dom.removeEventListener(eventType, dom.__gooactHandlers[eventType]);
        dom.__gooactHandlers[eventType] = value;
        dom.addEventListener(eventType, dom.__gooactHandlers[eventType]);
    } else if (key == 'checked' || key == 'value' || key == 'className') {
        dom[key] = value;
    } else if (key == 'style' && typeof value == 'object') {
        Object.assign(dom.style, value);
    } else if (key == 'ref' && typeof value == 'function') {
        value(dom);
    } else if (key == 'key') {
        dom.__gooactKey = value;
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(key, value);
    }
};

const render = (vdom, parent=null) => {
    const mount = parent ? (el => parent.appendChild(el)) : (el => el);
    if (typeof vdom == 'string' || typeof vdom == 'number') {
        return mount(document.createTextNode(vdom));
    } else if (typeof vdom == 'boolean' || vdom === null) {
        return mount(document.createTextNode(''));
    } else if (typeof vdom == 'object' && typeof vdom.type == 'function') {
        return Component.render(vdom, parent);
    } else if (typeof vdom == 'object' && typeof vdom.type == 'string') {
        const dom = mount(document.createElement(vdom.type));
        for (const child of [].concat(...vdom.children)) render(child, dom);
        for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
        return dom;
    } else {
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
};

const patch = (dom, vdom, parent=dom.parentNode) => {
    const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);
    if (typeof vdom == 'object' && typeof vdom.type == 'function') {
        return Component.patch(dom, vdom, parent);
    } else if (typeof vdom != 'object' && dom instanceof Text) {
        return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
    } else if (typeof vdom == 'object' && dom instanceof Text) {
        return replace(render(vdom, parent));
    } else if (typeof vdom == 'object' && dom.nodeName != vdom.type.toUpperCase()) {
        return replace(render(vdom, parent));
    } else if (typeof vdom == 'object' && dom.nodeName == vdom.type.toUpperCase()) {
        const pool = {};
        const active = document.activeElement;
        [].concat(...dom.childNodes).map((child, index) => {
            const key = child.__gooactKey || `__index_${index}`;
            pool[key] = child;
        });
        [].concat(...vdom.children).map((child, index) => {
            const key = child.props && child.props.key || `__index_${index}`;
            dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
            delete pool[key];
        });
        for (const key in pool) {
            const instance = pool[key].__gooactInstance;
            if (instance) instance.componentWillUnmount();
            pool[key].remove();
        }
        for (const attr of dom.attributes) dom.removeAttribute(attr.name);
        for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
        active.focus();
        return dom;
    }
};

class Component {
    constructor(props) {
        this.props = props || {};
        this.state = null;
    }

    static render(vdom, parent=null) {
        const props = Object.assign({}, vdom.props, {children: vdom.children});
        if (Component.isPrototypeOf(vdom.type)) {
            const instance = new (vdom.type)(props);
            instance.componentWillMount();
            instance.base = render(instance.render(), parent);
            instance.base.__gooactInstance = instance;
            instance.base.__gooactKey = vdom.props.key;
            instance.componentDidMount();
            return instance.base;
        } else {
            return render(vdom.type(props), parent);
        }
    }

    static patch(dom, vdom, parent=dom.parentNode) {
        const props = Object.assign({}, vdom.props, {children: vdom.children});
        if (dom.__gooactInstance && dom.__gooactInstance.constructor == vdom.type) {
            dom.__gooactInstance.componentWillReceiveProps(props);
            dom.__gooactInstance.props = props;
            return patch(dom, dom.__gooactInstance.render(), parent);
        } else if (Component.isPrototypeOf(vdom.type)) {
            const ndom = Component.render(vdom, parent);
            return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
        } else if (!Component.isPrototypeOf(vdom.type)) {
            return patch(dom, vdom.type(props), parent);
        }
    }

    setState(next) {
        const compat = (a) => typeof this.state == 'object' && typeof a == 'object';
        if (this.base && this.shouldComponentUpdate(this.props, next)) {
            const prevState = this.state;
            this.componentWillUpdate(this.props, next);
            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
            patch(this.base, this.render());
            this.componentDidUpdate(this.props, prevState);
        } else {
            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps != this.props || nextState != this.state;
    }

    componentWillReceiveProps(nextProps) {
        return undefined;
    }

    componentWillUpdate(nextProps, nextState) {
        return undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        return undefined;
    }

    componentWillMount() {
        return undefined;
    }

    componentDidMount() {
        return undefined;
    }

    componentWillUnmount() {
        return undefined;
    }
};

if (typeof module != 'undefined') module.exports = {createElement, render, Component};
if (typeof module == 'undefined') window.Gooact  = {createElement, render, Component};
})();