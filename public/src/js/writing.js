let getRandomPromptButton = document.querySelector('#get-random-prompt');
let createPostArea = document.querySelector('#create-post');
let randomPrompt = document.querySelector('#random-prompt-gets-put-here')
let form = document.querySelector('form');
let writingInput = document.querySelector('#writings');
let writingValue = '';
let date = new Date().toISOString(); // TODO change type in backend


/**
 *  WHEN "GET PROMPT" IS CLICKED
 */
getRandomPromptButton.addEventListener('click', getRandomPrompt);

function getRandomPrompt() {
    fetch('http://localhost:8082/random') // TODO update URL
        .then(response => {
            console.log('Getting data from promptAPI ...', response);
            return response.json();
        })
        .then(data => {
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

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(sw => {
                let writing = {
                    id: new Date().toISOString(),
                    text: writingValue,
                    date: date
                };

                writeData('sync-writings', writing)
                    .then(() => {
                        return sw.sync.register('sync-new-writing');
                    })
                    .then(() => {
                        let snackbarContainer = new MaterialSnackbar(document.querySelector('#confirmation-toast'));
                        let data = { message: 'Input saved for synchronisation!', timeout: 2000 };
                        snackbarContainer.showSnackbar(data);
                    });
            });
    } else {
        sendDataToBackend();
    }
});
function sendDataToBackend() {

    const requestData = {
        "date": date,
        "text": writingValue
    };

    fetch('http://localhost:3000/writing', { // TODO update URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set the Content-Type header
        },
        body: JSON.stringify(requestData) // Stringify the body data
    })
        .then(response => {
            console.log('Data sent to backend ...', response);
            return response.json();
        });
}


/**
 *  CACHING
 */
let networkDataReceived = false;

fetch('http://localhost:8082/prompt') // TODO update URL
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        networkDataReceived = true;
        console.log('From backend ...', data);
        updateUI(data);
    }).catch(error => {
        console.error('Error fetching data:', error);
    });


function updateUI(data) {
    const listElement = document.getElementById('prompt-list'); // Get the ul element by its ID.
    for (let prompt of data) {
        createBulletPoint(prompt, listElement); // Pass the ul element as the parentElement.
    }
}

function createBulletPoint(prompt, parentElement) {
    let listItem = document.createElement('li');
    listItem.className = ""; 
    listItem.textContent = prompt.promptQuestion;

    parentElement.appendChild(listItem); // Append the list item to the ul element.
}


if ('indexedDB' in window) {
    readAllData('prompts')
        .then(data => {
            if (!networkDataReceived) {
                console.log('From cache ...', data);
                updateUI(data);
            }
        })
}


