/**
 *  INDEXEDDB
 */


const db = idb.openDB('diary-store', 1, {
        upgrade(db) {
            const store2 = db.createObjectStore('sync-writings', {
                keyPath: 'id',
            });
            store2.createIndex('id', 'id');

            const store4 = db.createObjectStore('prompts', {
                keyPath: '_id',
            })
            store4.createIndex('_id', '_id');

            const store5 = db.createObjectStore('images', {
                keyPath: '_id',
            })
            store5.createIndex('_id', '_id');

            const store6 = db.createObjectStore('sync-images', {
                keyPath: 'id',
            })
            store6.createIndex('id', 'id');
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
