let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        let options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: '/favicon-32x32.png',
            image: '/android-chrome-192x192jpg',
            lang: 'en-UK',
            vibrate: [100, 50, 200],
            badge: '/favicon-32x32.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Ok', icon: '/android-chrome-192x192.png' },
                { action: 'cancel', title: 'Cancel', icon: '/android-chrome-192x192.png' },
            ]
        };

        navigator.serviceWorker.ready
            .then(sw => {
                sw.showNotification('Successfully subscribed!!', options);
            });
    }
}

function configurePushSubscription() {
    if (!('serviceWorker' in navigator)) {
        return
    }

    let swReg;
    navigator.serviceWorker.ready
        .then(sw => {
            swReg = sw;
            return sw.pushManager.getSubscription();
        })
        .then(sub => {
            if (sub === null) {
                // create a new subscription
                let vapidPublicKey = 'BDZuP4D-ZcRZq3GRa2sCykv3IKAfXRabGHEvTrnz7koVox_mVIWftR7NER9yh1_f5j7nnD8GDC4GVPD1SXWwaP0';
                let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey,
                })
            } else {
                // already subscribed

                // unsubsribes a subscription
            /* sub.unsubscribe()
                    .then(() => {
                        console.log('unsubscribed()', sub)
                    })*/
            }
        })
        .then(async newSub => {
            const response = await fetch('https://ikt-writingsapi.onrender.com/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            });
            if (response.ok) {
                displayConfirmNotification();
            }
        });
}


function askForNotificationPermission() {
    Notification.requestPermission(result => {
        console.log('User choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted');
        } else {
            //displayConfirmNotification();
            configurePushSubscription();
        }
    });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (let button of enableNotificationsButtons) {
        button.style.display = 'inline-block';
        button.addEventListener('click', askForNotificationPermission);
    }
}



function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}