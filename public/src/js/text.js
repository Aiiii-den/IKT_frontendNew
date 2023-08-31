let getRandomPromptButton = document.querySelector('#get-random-prompt');
let saveWritingButton = document.querySelector('#save-writing')


let createPostArea = document.querySelector('#create-post');
let form = document.querySelector('form');
let writingInput = document.querySelector('#writings');

let writingValue = '';

getRandomPromptButton.addEventListener('click', getRandomPrompt);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function getRandomPrompt(){

}

function getAllPrompts(){

}

function saveWriting(){

}


function updateUI(data) {

    for (let prompt of data) {
        createCard(prompt);
    }

}

function createCard(prompt) {
    let cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    let cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    let image = new Image();
    image.src = card.image_id;
    cardTitle.style.backgroundImage = 'url(' + image.src + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);
    let cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = card.title;
    cardTitle.appendChild(cardTitleTextElement);
    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = card.location;
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}


// --> CAUSES FOTO SAVING TO STOP WORKING
let networkDataReceived = false;

fetch('http://localhost:8080/prompt')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        networkDataReceived = true;
        console.log('From backend ...', data);
        updateUI(data);
    });

if('indexedDB' in window) {
    readAllData('prompt')
        .then( data => {
            if(!networkDataReceived) {
                console.log('From cache ...', data);
                updateUI(data);
            }
        })
}

let date = Date.now;

function sendDataToBackend() {
    const formData = new FormData();
    formData.append('date', date)
    formData.append('writing', writingValue);

    console.log('formData', formData)

    fetch('http://localhost:8080/writing', {
        method: 'POST',
        body: formData
    })
    .then( response => {
        console.log('Data sent to backend ...', response);
        return response.json();
    });
}



form.addEventListener('submit', event => {
    event.preventDefault(); 

    if (writingInput.value.trim() === '') {
        alert("Nothing's written!")
        return;
    }

    writingValue = writingInput.value;
    console.log('writingValue', writingValue)

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then( sw => {
                let writing = {
                    id: new Date().toISOString(),
                    writing: writingValue
                };

                writeData('sync-writing', writing)
                    .then( () => {
                        return sw.sync.register('sync-new-writing');
                    })
                    .then( () => {
                        let snackbarContainer = new MaterialSnackbar(document.querySelector('#confirmation-toast'));
                        let data = { message: 'Input saved for synchronisation!', timeout: 2000};
                        snackbarContainer.showSnackbar(data);
                    });
            });
    } else {
        sendDataToBackend();
    }
});