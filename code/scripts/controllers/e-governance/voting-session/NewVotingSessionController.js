const {WebcController} = WebCardinal.controllers;

export default class NewVotingSessionController extends WebcController {
    constructor(...props) {
        super(...props);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", (model, target, event) =>{
            event.preventDefault();
            event.stopImmediatePropagation();

            window.history.back();
        });

        this.onTagClick("next", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const votingTypeSelected = this.querySelector(`input[type="radio"]:checked`);
            if (votingTypeSelected) {
                const votingType = votingTypeSelected.value;
                this.navigateToPageTag(votingType);
            }
        });
    }
}