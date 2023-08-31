/**
 *  INDEXEDDB
 */


const db = idb.openDB('prompt-store', 1, {
    upgrade(db) {
        // Create a store of objects
        const store1 = db.createObjectStore('writings', {
            keyPath: '_id',
        });
        store1.createIndex('_id', '_id');

        // Create another store of objects
        const store2 = db.createObjectStore('sync-writings', {
            keyPath: 'id',
        });
        store2.createIndex('id', 'id');
    },
});


function writeData(st, data) {
    return db
        .then( dbPrompts => {
            let tx = dbPrompts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.put(data);
            return tx.done;
        })
}


function readAllData(st) {
    return db
        .then( dbPrompts => {
            let tx = dbPrompts.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        })
}

function clearAllData(st) {
    return db
        .then( dbPosts => {
            let tx = dbPrompts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.clear();
            return tx.done;
        })
}
