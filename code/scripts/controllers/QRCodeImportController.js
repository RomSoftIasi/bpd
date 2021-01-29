import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class QRCodeImportController extends ModalController {
    constructor(element, history) {
        super(element, history);
        debugger
        this.setModel({
            data: '',
            importIsDisabled: true
        })

        this.importSeedInputOnChange();
        this.importOnClick();
    }

    importSeedInputOnChange() {
        this.model.onChange("data", (value) => {
            this.model.importIsDisabled = this.model.data.length <= 5;
        })
    }

    importOnClick() {
        this.on('import-on-click', (event) => {
            this._finishProcess(event, {
                value: this.model.data
            });
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
