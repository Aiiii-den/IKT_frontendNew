importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const CACHE_VERSION = 7;
const CURRENT_STATIC_CACHE = 'static-v' + CACHE_VERSION;
const CURRENT_DYNAMIC_CACHE = 'dynamic-v' + CACHE_VERSION;

self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE)
            .then(cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/history/index.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/js/idb.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    'android-chrome-192x192.png',
                    'android-chrome-512x512.png',
                    'apple-touch-icon.png',
                    'favicon-16x16.png',
                    'favicon-32x32.png',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css',
                    'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
                ]);
            })
    );
})



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

self.addEventListener('fetch', event => {
    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contains http.
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    const url = 'http://localhost:3000/prompt';
    if (event.request.url.indexOf(url) >= 0) {
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
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(res => {     // nicht erneut response nehmen, haben wir schon
                                return caches.open(CURRENT_DYNAMIC_CACHE)      // neuer, weiterer Cache namens dynamic
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

self.addEventListener('sync', event => {
    console.log('service worker --> background syncing ...', event);
    if (event.tag === 'sync-new-post') {
        console.log('service worker --> syncing new posts ...');
        event.waitUntil(
            readAllData('sync-posts')
                .then(dataArray => {
                    for (let data of dataArray) {
                        console.log('data from IndexedDB', data);
                        const formData = new FormData();
                        formData.append('title', data.title);
                        formData.append('location', data.location);
                        formData.append('file', data.image_id);

                        console.log('formData', formData)

                        fetch('http://localhost:3000/posts', {
                            method: 'POST',
                            body: formData
                        })
                            .then(response => {
                                console.log('Data sent to backend ...', response);
                                if (response.ok) {
                                    deleteOneData('sync-posts', data.id)
                                }
                            })
                            .catch(err => {
                                console.log('Error while sending data to backend ...', err);
                            })
                    }
                })
        );
    }
})

self.addEventListener('notificationclick', event => {
    let notification = event.notification;
    let action = event.action;

    console.log(notification);

    if(action === 'confirm') {
        console.log('confirm was chosen');
        notification.close();
    } else {
        console.log(action);
    }
});

self.addEventListener('notificationclose', event => {
    console.log('notification was closed', event);
});
