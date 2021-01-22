import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationModel from "../../models/OrganizationModel.js";

export default class BPDController1 extends ContainerController {
    constructor(element) {
        super(element);

        this.feedbackEmitter = null;

        // ================ Model setup
        // Model is singleton in order to preserve state across
        // different same controller instances
        this.orgModel = OrganizationModel.getInstance();
    }

    /**
     * Parse hash fragment params given as:
     * #var1=2&var2=3&var3=4
     *
     * @return {object}
     */
    parseHashFragmentParams() {
        const hashParams = window.location.hash.substr(1);
        const segments = hashParams.split('&');
        const params = {};

        for (let i = 0; i < segments.length; i++) {
            const paramSegments = segments[i].split('=');
            const key = paramSegments.shift();
            const value = paramSegments.join('=');

            params[key] = value;
        }
        return params;
    }

    /**
     * Show an error alert
     * @param {Error|object|string} err
     */
    showError(err, title, type) {
        let errMessage;
        title = title ? title : 'Validation Error';
        type = type ? type : 'alert-danger';

        if (err instanceof Error) {
            errMessage = err.message;
        } else if (typeof err === 'object') {
            errMessage = err.toString();
        } else {
            errMessage = err;
        }
        this.feedbackEmitter(errMessage, title, type);
    }

    /**
     * Redirect to another url
     *
     * @param {string} url
     */
    redirect(url) {
        this.render('psk-route-redirect', { url });
    }

    /**
     * Render new child in the current element
     * @param {string} tag
     * @param {object} attributes
     * @return {Element}
     */
    render(tag, attributes) {
        attributes = attributes || {};
        const el = document.createElement(tag);
        for (const attr in attributes) {
            const value = attributes[attr];
            el.setAttribute(attr, value);
        }

        this.element.appendChild(el);
        return el;
    }
}
