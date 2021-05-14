const {WebcController} = WebCardinal.controllers;

export default class ShareQRCodeController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model.title = `QR Code for ${this.model.name}`;
    }
}