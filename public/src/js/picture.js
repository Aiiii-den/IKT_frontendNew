let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');
let moodInput = document.querySelector('#mood');
let dateInput = document.querySelector('#date');
let file = null;
let titleValue = '';
let locationValue = '';
let moodValue = '';
let dateValue = '';
let imageURI = '';
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');
let locationButton = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation;



function initializeMedia() {
    if (!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            }

            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch(err => {
            imagePickerArea.style.display = 'block';
        });
}



function openCreatePostModal() {
    setTimeout(() => {
        createPostArea.style.transform = 'translateY(0)';
    }, 1);
    initializeMedia();
    initializeLocation();
}

function closeCreatePostModal() {
    imagePickerArea.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (videoPlayer.srcObject) {
        videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
    }
    setTimeout(() => {
        createPostArea.style.transform = 'translateY(100vH)';
    }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function updateUI(data) {

    for (let card of data) {
        createCard(card);
    }
}

function createCard(card) {
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
    cardTitleTextElement.textContent = card.title + "-" + card.mood;
    cardTitle.appendChild(cardTitleTextElement);

    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = card.location + " - " + card.date;
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);

    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

/*
// --> CAUSES FOTO SAVING TO STOP WORKING  WTF IS GOING ON?
let networkDataReceived = false;

fetch('http://localhost:8080/image')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        networkDataReceived = true;
        console.log('From backend ...', data);
        updateUI(data);
    });

if('indexedDB' in window) {
    readAllData('images')
        .then( data => {
            if(!networkDataReceived) {
                console.log('From cache ...', data);
                updateUI(data);
            }
        })
}*/

function sendDataToBackend() {
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('mood', moodValue);
    formData.append('date', dateValue);
    formData.append('location', locationValue);
    formData.append('file', file);

    console.log('formData', formData)

    fetch('http://localhost:8080/image', { 
        method: 'POST',
        body: formData
    })
    .then( response => {
        console.log('Data sent to backend ...', response);
        return response.json();
    })
    .then( data => {
        console.log('data ...', data);
        const newPost = {
            title: data.title,
            mood: data.mood,
            date: data.date,
            location: data.location,
            image_id: imageURI
        }
        updateUI([newPost]);
    });
}


form.addEventListener('submit', event => {
    event.preventDefault(); 

    if (file == null) {
        alert('Take a pic first!')
        return;
    }
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '' || moodInput.value.trim() === '' || dateInput.value.trim() === '') {
        alert('Please input title, mood, date and location!')
        return;
    }

    closeCreatePostModal();

    titleValue = titleInput.value;
    moodValue = moodInput.value;
    dateValue = dateInput.value;
    locationValue = locationInput.value;

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then( sw => {
                let image = {
                    id: new Date().toISOString(),
                    title: titleValue,
                    mood: moodValue,
                    date: dateValue,
                    location: locationValue,
                    image_id: file
                };

                writeData('sync-images', image)
                    .then( () => {
                        return sw.sync.register('sync-new-image');
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


captureButton.addEventListener('click', event => {
    event.preventDefault(); // nicht absenden und neu laden
    canvasElement.style.display = 'block';
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    let context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    videoPlayer.srcObject.getVideoTracks().forEach(track => {
        track.stop();
    })
    imageURI = canvas.toDataURL("image/jpeg");
    // console.log('imageURI', imageURI)       // base64-String des Bildes

    fetch(imageURI)
        .then(res => {
            return res.blob()
        })
        .then(blob => {
            file = new File([blob], "myFile.jpeg", { type: "image/jpeg" })
            console.log('file', file)
        })
});

imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});


/**
 *  GEOLOCATION
 */

function initializeLocation() {
    if(!('geolocation' in navigator)) {
        locationButton.style.display = 'none';
    }
}
locationButton.addEventListener('click', event => {
    if(!('geolocation' in navigator)) {
        return;
    }

    locationButton.style.display = 'none';
    locationLoader.style.display = 'block';

    navigator.geolocation.getCurrentPosition( position => {
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        console.log('current position: ', fetchedLocation);

        let nominatimURL = 'https://nominatim.openstreetmap.org/reverse'; 
        nominatimURL += '?format=jsonv2';   // format=[xml|json|jsonv2|geojson|geocodejson]
        nominatimURL += '&lat=' + fetchedLocation.latitude;
        nominatimURL += '&lon=' + fetchedLocation.longitude;

        fetch(nominatimURL)
            .then((res) => {
                console.log('nominatim res ...', res);
                return res.json();
            })
            .then((data) => {
                console.log('nominatim res.json() ...', data);
                locationInput.value = data.display_name;
            })
            .catch( (err) => {
                console.error('err', err)
                locationInput.value = 'Berlin';
            });

        document.querySelector('#manual-location').classList.add('is-focused');
    }, err => {
        console.log(err);
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        alert('Couldn\'t fetch location, please enter manually!');
        fetchedLocation = null;
    }, { timeout: 5000});
});
