/**
 *  INDEXEDDB
 */


const db = idb.openDB('diary-store', 1, {
        upgrade(db) {
            const writingSync = db.createObjectStore('sync-writings', {
                keyPath: 'id',
            });
            writingSync.createIndex('id', 'id');

            const promptsBE = db.createObjectStore('prompts', {
                keyPath: '_id',
            })
            promptsBE.createIndex('_id', '_id');

            const imagesBE = db.createObjectStore('images', {
                keyPath: '_id',
            })
            imagesBE.createIndex('_id', '_id');

            const imagesSync = db.createObjectStore('sync-images', {
                keyPath: 'id',
            })
            imagesSync.createIndex('id', 'id');
        },
    });

function writeData(st, data) {
    return db
        .then(dbStore => {
            let tx = dbStore.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.put(data);
            return tx.done;
        })
}

function readAllData(st) {
    return db
        .then(dbStore => {
            let tx = dbStore.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        })
}

function clearAllData(st) {
    return db
        .then(dbStore => {
            let tx = dbStore.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.clear();
            return tx.done;
        })
}

function deleteOneData(st, id) {
    db
        .then(dbStore => {
            let tx = dbStore.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.delete(id);
            return tx.done;
        })
        .then(() => {
            console.log('Data deleted ...');
        });
}
