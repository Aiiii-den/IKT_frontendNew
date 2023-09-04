importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const CACHE_VERSION = 55;
const CURRENT_STATIC_CACHE = 'static-v' + CACHE_VERSION;
const CURRENT_DYNAMIC_CACHE = 'dynamic-v' + CACHE_VERSION;

/**
 *  INSTALLING SERVICE WORKER + STATIC CACHING
 */
self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE)
            .then(cache => {
                console.log('Service-Worker-Cache created and open');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/writing/index.html',
                    '/src/js/app.js',
                    '/src/js/picture.js',
                    '/src/js/writing.js',
                    '/src/js/material.min.js',
                    '/src/js/idb.js',
                    '/src/css/app.css',
                    '/src/css/picture.css',
                    '/src/css/writing.css',
                    'android-chrome-192x192.png',
                    'android-chrome-512x512.png',
                    'apple-touch-icon.png',
                    'favicon-16x16.png',
                    'favicon-32x32.png',
                    'maskable_icon.png',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap', 
                    'https://fonts.googleapis.com/icon?family=Material+Icons&display=swap',
                    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css'
                ]);
            })
    );
})

/**
 *  ACTIVE SERVICE WORKER + CACHING
 */
self.addEventListener('activate', event => {
    console.log('service worker --> activating ...', event);
    event.waitUntil(
        caches.keys()
            .then(keyList => {
                return Promise.all(keyList.map(key => {
                    if (key !== CURRENT_STATIC_CACHE && key !== CURRENT_DYNAMIC_CACHE) {
                        console.log('service worker --> old cache removed :', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
})

/**
 *  DYNAMIC CACHING -- gets the cached example prompts      --> the fetch one for prompts and the sync one for writings??
 */
self.addEventListener('fetch', event => {
    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contains http.
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    if (event.request.url.includes('prompt')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clonedResponse = res.clone();
                    clearAllData('prompts')
                        .then(() => {
                            return clonedResponse.json();
                        })
                        .then(data => {
                            for (let key in data) {
                                console.log('write data', data[key]);
                                writeData('prompts', data[key]);
                            }
                        });
                    return res;
                })
        )
    }else if (event.request.url.includes('/image')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clonedResponse = res.clone();
                    clearAllData('images')
                        .then(() => {
                            return clonedResponse.json();
                        })
                        .then(data => {
                            for (let key in data) {
                                console.log('write data', data[key]);
                                writeData('images', data[key]);
                            }
                        });
                    return res;
                })
        )
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(res => {
                                return caches.open(CURRENT_DYNAMIC_CACHE)
                                    .then(cache => {
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            });
                    }
                })
        )
    }
})


/**
 *  BACKGROUND SYNC -- saves the posted writing/text 
 */
self.addEventListener('sync', event => {
    console.log('service worker --> background syncing ...', event);
    if (event.tag === 'sync-new-writing') {
        console.log('service worker --> syncing new writings ...');
        event.waitUntil(
            readAllData('sync-writings')
                .then(dataArray => {
                    for (let data of dataArray) {
                        console.log('data from IndexedDB', data);

                        const requestData = {
                            "date": data.date,
                            "text": data.text
                        };

                        console.log('requestData', requestData)

                        fetch('http://localhost:3000/writing', { // TODO change to https://ikt-writingsapi.onrender.com/writing
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json' // Set the Content-Type header
                            },
                            body: JSON.stringify(requestData) // Stringify the body data
                        }).then(response => {
                            console.log('Data sent to backend ...', response);
                            if (response.ok) {
                                deleteOneData('sync-writings', data.id)
                            }
                        })
                            .catch(err => {
                                console.log('Error while sending data to backend ...', err);
                            })
                    }
                })
        );/*
    } else if (event.tag === 'sync-new-image') {
        console.log('service worker --> syncing new image ...');
        event.waitUntil(
            readAllData('sync-images')
                .then(dataArray => {
                    for (let data of dataArray) {
                        console.log('data from IndexedDB', data);
                        const formData = new FormData();
                        formData.append('title', data.title);
                        formData.append('mood', data.mood);
                        formData.append('date', data.date);
                        formData.append('location', data.location);
                        formData.append('file', data.image_id);

                        console.log('formData', formData)

                        fetch('http://localhost:8083/image', {
                            method: 'POST',
                            body: formData
                        })
                            .then(response => {
                                console.log('Data sent to backend ...', response);
                                if (response.ok) {
                                    deleteOneData('sync-images', data.id)
                                }
                            })
                            .catch(err => {
                                console.log('Error while sending data to backend ...', err);
                            })
                    }
                })
        )*/
    }
})


/**
 *  PUSH NOTIF
 */
self.addEventListener('notificationclick', event => {
    let notification = event.notification;
    let action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()    
                .then(clientsArray => {
                    let client = clientsArray.find(c => {
                        return c.visibilityState === 'visible';
                    });

                    if (client !== undefined) {
                        //client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
        );
    }
});


self.addEventListener('notificationclose', event => {
    console.log('notification was closed', event);
});


self.addEventListener('push', event => {
    console.log('push notification received', event);
    let data = { title: 'Test', content: 'Fallback message', openUrl: '/' };
    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    let options = {
        body: data.content,
        icon: '/src/favicon-32x32.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
