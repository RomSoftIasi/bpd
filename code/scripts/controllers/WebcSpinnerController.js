const {loader, root} = WebCardinal;

function displayLoader() {
    root.style.filter = 'grayscale(100%)'
    loader.hidden = false;
}

function hideLoader() {
    root.style.filter = 'none';
    loader.hidden = true;
}

export {
    displayLoader,
    hideLoader
};