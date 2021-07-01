function getFormattedDate(timestamp) {
    if (!timestamp) {
        timestamp = Date.now();
    }

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}/${year}`;
}

function downloadFile(path, fileName) {
    if (path === '/') {
        path = '';
    }

    let url = `/download${path}/${fileName}`;
    fetch(url)
        .then((response) => {
            if (response.ok) {
                response.blob().then((blob) => {
                    downloadFileToDevice(path, fileName, {
                        contentType: response.headers.get('Content-Type') || '',
                        rawBlob: blob
                    });
                });
            } else {
                console.error(`Error on download file ${path}/${fileName}: `, response);
            }
        });
}

function downloadFileToDevice(path, fileName, downloadedFile) {
    window.URL = window.URL || window.webkitURL;
    let blob = downloadedFile.rawBlob;

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        const file = new File([blob], fileName);
        window.navigator.msSaveOrOpenBlob(file);
        return;
    }

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

export {
    getFormattedDate,
    downloadFile
};