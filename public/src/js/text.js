let getRandomPromptButton = document.querySelector('#get-random-prompt');
let createPostArea = document.querySelector('#create-post');
let randomPrompt = document.querySelector('#random-prompt-gets-put-here')
let form = document.querySelector('form');
let writingInput = document.querySelector('#writings');
let writingValue = '';
let date = new Date().toISOString(); // TODO change type in backend


/**
 *  ONLOAD
 */
window.onload = function() {
    getAllPrompts();
};
function getAllPrompts(){
    fetch('http://localhost:8080/prompt') //TODO make the port for prompt & text different and rename /text to /writing in API
    .then( response => {
        console.log('Getting data from promptAPI ...', response);
        return response.json();
    })
    .then( data => {
        console.log('data ...', data);
        updateUI(data)
    }).catch(error => {
        console.error('Error fetching data:', error);
    });
}


/**
 *  WHEN "GET PROMPT" IS CLICKED
 */
getRandomPromptButton.addEventListener('click', getRandomPrompt);

function getRandomPrompt(){
    fetch('http://localhost:8080/randomPrompt')
    .then( response => {
        console.log('Getting data from promptAPI ...', response);
        return response.json();
    })
    .then( data => {
        console.log('data ...', data);
        randomPrompt.innerHTML = data.promptQuestion;
    }).catch(error => {
        console.error('Error fetching data:', error);
    });
}


/**
 *  WHEN SAVE WRITING IS CLICKED
 */
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
                    text: writingValue
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
function sendDataToBackend() {
    const formData = new FormData();
    formData.append('date', date)
    formData.append('text', writingValue);

    console.log('formData', formData)

    fetch('http://localhost:8080/writing', { // TODO port!!
        method: 'POST',
        body: formData
    })
    .then( response => {
        console.log('Data sent to backend ...', response);
        return response.json();
    });
}


/**
 *  CACHING
 */
let networkDataReceived = false;

fetch('http://localhost:8080/prompt') // TODO port!!
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


