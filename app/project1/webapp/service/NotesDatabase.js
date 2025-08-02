sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    return BaseObject.extend("project1.service.NotesDatabase", {

        constructor: function() {
            BaseObject.prototype.constructor.apply(this, arguments);
            this._db = null;
            this._initDatabase();
        },

        /**
         * Initialize SQLite database
         */
        _initDatabase: function() {
            // Check if we're in a browser environment that supports IndexedDB
            if (typeof window !== 'undefined' && window.indexedDB) {
                this._initIndexedDB();
            } else {
                // Fallback to localStorage for now
                this._initLocalStorage();
            }
        },

        /**
         * Initialize IndexedDB (better than localStorage for complex data)
         */
        _initIndexedDB: function() {
            const request = indexedDB.open("NotionNotesDB", 1);
            
            request.onerror = () => {
                console.error("Failed to open IndexedDB, falling back to localStorage");
                this._initLocalStorage();
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                console.log("IndexedDB initialized successfully");
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create notes table
                if (!db.objectStoreNames.contains("notes")) {
                    const notesStore = db.createObjectStore("notes", { keyPath: "id" });
                    notesStore.createIndex("title", "title", { unique: false });
                    notesStore.createIndex("created", "created", { unique: false });
                    notesStore.createIndex("lastModified", "lastModified", { unique: false });
                    notesStore.createIndex("category", "category", { unique: false });
                }

                // Create blocks table for note content
                if (!db.objectStoreNames.contains("blocks")) {
                    const blocksStore = db.createObjectStore("blocks", { keyPath: "id" });
                    blocksStore.createIndex("noteId", "noteId", { unique: false });
                    blocksStore.createIndex("order", "order", { unique: false });
                    blocksStore.createIndex("type", "type", { unique: false });
                }

                // Create tags table
                if (!db.objectStoreNames.contains("tags")) {
                    const tagsStore = db.createObjectStore("tags", { keyPath: "id" });
                    tagsStore.createIndex("name", "name", { unique: true });
                }
            };
        },

        /**
         * Fallback to localStorage
         */
        _initLocalStorage: function() {
            this._storageType = "localStorage";
            
            // Initialize storage structure if not exists
            if (!localStorage.getItem("notionNotes")) {
                localStorage.setItem("notionNotes", JSON.stringify([]));
            }
            if (!localStorage.getItem("notionBlocks")) {
                localStorage.setItem("notionBlocks", JSON.stringify([]));
            }
            if (!localStorage.getItem("notionTags")) {
                localStorage.setItem("notionTags", JSON.stringify([]));
            }
            
            console.log("localStorage initialized for notes storage");
        },

        /**
         * Create a new note
         */
        createNote: function(noteData) {
            return new Promise((resolve, reject) => {
                const note = {
                    id: this._generateId(),
                    title: noteData.title || "Untitled",
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    category: noteData.category || "Personal",
                    tags: noteData.tags || [],
                    wordCount: 0,
                    charCount: 0,
                    preview: ""
                };

                if (this._storageType === "localStorage") {
                    this._createNoteLocalStorage(note, resolve, reject);
                } else {
                    this._createNoteIndexedDB(note, resolve, reject);
                }
            });
        },

        /**
         * Create note in localStorage
         */
        _createNoteLocalStorage: function(note, resolve, reject) {
            try {
                const notes = JSON.parse(localStorage.getItem("notionNotes") || "[]");
                notes.unshift(note);
                localStorage.setItem("notionNotes", JSON.stringify(notes));
                resolve(note);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Create note in IndexedDB
         */
        _createNoteIndexedDB: function(note, resolve, reject) {
            const transaction = this._db.transaction(["notes"], "readwrite");
            const store = transaction.objectStore("notes");
            const request = store.add(note);

            request.onsuccess = () => resolve(note);
            request.onerror = () => reject(request.error);
        },

        /**
         * Get all notes
         */
        getAllNotes: function() {
            return new Promise((resolve, reject) => {
                if (this._storageType === "localStorage") {
                    this._getAllNotesLocalStorage(resolve, reject);
                } else {
                    this._getAllNotesIndexedDB(resolve, reject);
                }
            });
        },

        /**
         * Get all notes from localStorage
         */
        _getAllNotesLocalStorage: function(resolve, reject) {
            try {
                const notes = JSON.parse(localStorage.getItem("notionNotes") || "[]");
                resolve(notes);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Get all notes from IndexedDB
         */
        _getAllNotesIndexedDB: function(resolve, reject) {
            const transaction = this._db.transaction(["notes"], "readonly");
            const store = transaction.objectStore("notes");
            const request = store.getAll();

            request.onsuccess = () => {
                const notes = request.result.sort((a, b) => 
                    new Date(b.lastModified) - new Date(a.lastModified)
                );
                resolve(notes);
            };
            request.onerror = () => reject(request.error);
        },

        /**
         * Update a note
         */
        updateNote: function(noteId, updateData) {
            return new Promise((resolve, reject) => {
                updateData.lastModified = new Date().toISOString();
                
                if (this._storageType === "localStorage") {
                    this._updateNoteLocalStorage(noteId, updateData, resolve, reject);
                } else {
                    this._updateNoteIndexedDB(noteId, updateData, resolve, reject);
                }
            });
        },

        /**
         * Update note in localStorage
         */
        _updateNoteLocalStorage: function(noteId, updateData, resolve, reject) {
            try {
                const notes = JSON.parse(localStorage.getItem("notionNotes") || "[]");
                const index = notes.findIndex(note => note.id === noteId);
                
                if (index !== -1) {
                    notes[index] = { ...notes[index], ...updateData };
                    localStorage.setItem("notionNotes", JSON.stringify(notes));
                    resolve(notes[index]);
                } else {
                    reject(new Error("Note not found"));
                }
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Update note in IndexedDB
         */
        _updateNoteIndexedDB: function(noteId, updateData, resolve, reject) {
            const transaction = this._db.transaction(["notes"], "readwrite");
            const store = transaction.objectStore("notes");
            const getRequest = store.get(noteId);

            getRequest.onsuccess = () => {
                const note = getRequest.result;
                if (note) {
                    const updatedNote = { ...note, ...updateData };
                    const putRequest = store.put(updatedNote);
                    putRequest.onsuccess = () => resolve(updatedNote);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error("Note not found"));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        },

        /**
         * Delete a note
         */
        deleteNote: function(noteId) {
            return new Promise((resolve, reject) => {
                if (this._storageType === "localStorage") {
                    this._deleteNoteLocalStorage(noteId, resolve, reject);
                } else {
                    this._deleteNoteIndexedDB(noteId, resolve, reject);
                }
            });
        },

        /**
         * Delete note from localStorage
         */
        _deleteNoteLocalStorage: function(noteId, resolve, reject) {
            try {
                const notes = JSON.parse(localStorage.getItem("notionNotes") || "[]");
                const filteredNotes = notes.filter(note => note.id !== noteId);
                localStorage.setItem("notionNotes", JSON.stringify(filteredNotes));
                
                // Also delete associated blocks
                const blocks = JSON.parse(localStorage.getItem("notionBlocks") || "[]");
                const filteredBlocks = blocks.filter(block => block.noteId !== noteId);
                localStorage.setItem("notionBlocks", JSON.stringify(filteredBlocks));
                
                resolve(true);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Delete note from IndexedDB
         */
        _deleteNoteIndexedDB: function(noteId, resolve, reject) {
            const transaction = this._db.transaction(["notes", "blocks"], "readwrite");
            const notesStore = transaction.objectStore("notes");
            const blocksStore = transaction.objectStore("blocks");

            // Delete note
            const deleteNoteRequest = notesStore.delete(noteId);
            
            // Delete associated blocks
            const blocksIndex = blocksStore.index("noteId");
            const blocksRequest = blocksIndex.openCursor(IDBKeyRange.only(noteId));
            
            blocksRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        },

        /**
         * Generate unique ID
         */
        _generateId: function() {
            return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    });
});
