sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    return BaseObject.extend("project1.service.BlockManager", {

        constructor: function(database) {
            BaseObject.prototype.constructor.apply(this, arguments);
            this._database = database;
        },

        /**
         * Block types supported (like Notion)
         */
        BLOCK_TYPES: {
            PARAGRAPH: "paragraph",
            HEADING_1: "heading_1", 
            HEADING_2: "heading_2",
            HEADING_3: "heading_3",
            BULLET_LIST: "bulleted_list_item",
            NUMBERED_LIST: "numbered_list_item",
            TODO: "to_do",
            QUOTE: "quote",
            CODE: "code",
            DIVIDER: "divider",
            IMAGE: "image",
            LINK: "bookmark"
        },

        /**
         * Create a new block
         */
        createBlock: function(noteId, blockData) {
            return new Promise((resolve, reject) => {
                const block = {
                    id: this._generateBlockId(),
                    noteId: noteId,
                    type: blockData.type || this.BLOCK_TYPES.PARAGRAPH,
                    content: blockData.content || "",
                    properties: blockData.properties || {},
                    order: blockData.order || 0,
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };

                if (this._database._storageType === "localStorage") {
                    this._createBlockLocalStorage(block, resolve, reject);
                } else {
                    this._createBlockIndexedDB(block, resolve, reject);
                }
            });
        },

        /**
         * Create block in localStorage
         */
        _createBlockLocalStorage: function(block, resolve, reject) {
            try {
                const blocks = JSON.parse(localStorage.getItem("notionBlocks") || "[]");
                blocks.push(block);
                localStorage.setItem("notionBlocks", JSON.stringify(blocks));
                resolve(block);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Create block in IndexedDB
         */
        _createBlockIndexedDB: function(block, resolve, reject) {
            const transaction = this._database._db.transaction(["blocks"], "readwrite");
            const store = transaction.objectStore("blocks");
            const request = store.add(block);

            request.onsuccess = () => resolve(block);
            request.onerror = () => reject(request.error);
        },

        /**
         * Get all blocks for a note
         */
        getBlocksForNote: function(noteId) {
            return new Promise((resolve, reject) => {
                if (this._database._storageType === "localStorage") {
                    this._getBlocksLocalStorage(noteId, resolve, reject);
                } else {
                    this._getBlocksIndexedDB(noteId, resolve, reject);
                }
            });
        },

        /**
         * Get blocks from localStorage
         */
        _getBlocksLocalStorage: function(noteId, resolve, reject) {
            try {
                const blocks = JSON.parse(localStorage.getItem("notionBlocks") || "[]");
                const noteBlocks = blocks
                    .filter(block => block.noteId === noteId)
                    .sort((a, b) => a.order - b.order);
                resolve(noteBlocks);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Get blocks from IndexedDB
         */
        _getBlocksIndexedDB: function(noteId, resolve, reject) {
            const transaction = this._database._db.transaction(["blocks"], "readonly");
            const store = transaction.objectStore("blocks");
            const index = store.index("noteId");
            const request = index.getAll(noteId);

            request.onsuccess = () => {
                const blocks = request.result.sort((a, b) => a.order - b.order);
                resolve(blocks);
            };
            request.onerror = () => reject(request.error);
        },

        /**
         * Update a block
         */
        updateBlock: function(blockId, updateData) {
            return new Promise((resolve, reject) => {
                updateData.lastModified = new Date().toISOString();
                
                if (this._database._storageType === "localStorage") {
                    this._updateBlockLocalStorage(blockId, updateData, resolve, reject);
                } else {
                    this._updateBlockIndexedDB(blockId, updateData, resolve, reject);
                }
            });
        },

        /**
         * Update block in localStorage
         */
        _updateBlockLocalStorage: function(blockId, updateData, resolve, reject) {
            try {
                const blocks = JSON.parse(localStorage.getItem("notionBlocks") || "[]");
                const index = blocks.findIndex(block => block.id === blockId);
                
                if (index !== -1) {
                    blocks[index] = { ...blocks[index], ...updateData };
                    localStorage.setItem("notionBlocks", JSON.stringify(blocks));
                    resolve(blocks[index]);
                } else {
                    reject(new Error("Block not found"));
                }
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Update block in IndexedDB
         */
        _updateBlockIndexedDB: function(blockId, updateData, resolve, reject) {
            const transaction = this._database._db.transaction(["blocks"], "readwrite");
            const store = transaction.objectStore("blocks");
            const getRequest = store.get(blockId);

            getRequest.onsuccess = () => {
                const block = getRequest.result;
                if (block) {
                    const updatedBlock = { ...block, ...updateData };
                    const putRequest = store.put(updatedBlock);
                    putRequest.onsuccess = () => resolve(updatedBlock);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error("Block not found"));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        },

        /**
         * Delete a block
         */
        deleteBlock: function(blockId) {
            return new Promise((resolve, reject) => {
                if (this._database._storageType === "localStorage") {
                    this._deleteBlockLocalStorage(blockId, resolve, reject);
                } else {
                    this._deleteBlockIndexedDB(blockId, resolve, reject);
                }
            });
        },

        /**
         * Delete block from localStorage
         */
        _deleteBlockLocalStorage: function(blockId, resolve, reject) {
            try {
                const blocks = JSON.parse(localStorage.getItem("notionBlocks") || "[]");
                const filteredBlocks = blocks.filter(block => block.id !== blockId);
                localStorage.setItem("notionBlocks", JSON.stringify(filteredBlocks));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        },

        /**
         * Delete block from IndexedDB
         */
        _deleteBlockIndexedDB: function(blockId, resolve, reject) {
            const transaction = this._database._db.transaction(["blocks"], "readwrite");
            const store = transaction.objectStore("blocks");
            const request = store.delete(blockId);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        },

        /**
         * Reorder blocks
         */
        reorderBlocks: function(noteId, blockIds) {
            return new Promise((resolve, reject) => {
                const promises = blockIds.map((blockId, index) => {
                    return this.updateBlock(blockId, { order: index });
                });

                Promise.all(promises)
                    .then(() => resolve(true))
                    .catch(reject);
            });
        },

        /**
         * Convert block content to HTML for display
         */
        blockToHTML: function(block) {
            const content = this._escapeHtml(block.content);
            const properties = block.properties || {};

            switch (block.type) {
                case this.BLOCK_TYPES.HEADING_1:
                    return `<h1 class="notion-heading-1">${content}</h1>`;
                case this.BLOCK_TYPES.HEADING_2:
                    return `<h2 class="notion-heading-2">${content}</h2>`;
                case this.BLOCK_TYPES.HEADING_3:
                    return `<h3 class="notion-heading-3">${content}</h3>`;
                case this.BLOCK_TYPES.BULLET_LIST:
                    return `<li class="notion-bullet-item">${content}</li>`;
                case this.BLOCK_TYPES.NUMBERED_LIST:
                    return `<li class="notion-numbered-item">${content}</li>`;
                case this.BLOCK_TYPES.TODO:
                    const checked = properties.checked ? 'checked' : '';
                    return `<div class="notion-todo"><input type="checkbox" ${checked} disabled> ${content}</div>`;
                case this.BLOCK_TYPES.QUOTE:
                    return `<blockquote class="notion-quote">${content}</blockquote>`;
                case this.BLOCK_TYPES.CODE:
                    return `<pre class="notion-code"><code>${content}</code></pre>`;
                case this.BLOCK_TYPES.DIVIDER:
                    return `<hr class="notion-divider">`;
                case this.BLOCK_TYPES.IMAGE:
                    return `<img src="${properties.url}" alt="${content}" class="notion-image">`;
                case this.BLOCK_TYPES.LINK:
                    return `<a href="${properties.url}" target="_blank" class="notion-link">${content}</a>`;
                default:
                    return `<p class="notion-paragraph">${content}</p>`;
            }
        },

        /**
         * Parse markdown-like syntax to blocks
         */
        parseMarkdownToBlocks: function(text) {
            const lines = text.split('\n');
            const blocks = [];
            let order = 0;

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;

                let block = {
                    type: this.BLOCK_TYPES.PARAGRAPH,
                    content: trimmed,
                    order: order++,
                    properties: {}
                };

                // Parse different block types
                if (trimmed.startsWith('# ')) {
                    block.type = this.BLOCK_TYPES.HEADING_1;
                    block.content = trimmed.substring(2);
                } else if (trimmed.startsWith('## ')) {
                    block.type = this.BLOCK_TYPES.HEADING_2;
                    block.content = trimmed.substring(3);
                } else if (trimmed.startsWith('### ')) {
                    block.type = this.BLOCK_TYPES.HEADING_3;
                    block.content = trimmed.substring(4);
                } else if (trimmed.startsWith('- ')) {
                    block.type = this.BLOCK_TYPES.BULLET_LIST;
                    block.content = trimmed.substring(2);
                } else if (trimmed.match(/^\d+\. /)) {
                    block.type = this.BLOCK_TYPES.NUMBERED_LIST;
                    block.content = trimmed.replace(/^\d+\. /, '');
                } else if (trimmed.startsWith('- [ ] ')) {
                    block.type = this.BLOCK_TYPES.TODO;
                    block.content = trimmed.substring(6);
                    block.properties.checked = false;
                } else if (trimmed.startsWith('- [x] ')) {
                    block.type = this.BLOCK_TYPES.TODO;
                    block.content = trimmed.substring(6);
                    block.properties.checked = true;
                } else if (trimmed.startsWith('> ')) {
                    block.type = this.BLOCK_TYPES.QUOTE;
                    block.content = trimmed.substring(2);
                } else if (trimmed.startsWith('```')) {
                    block.type = this.BLOCK_TYPES.CODE;
                    block.content = trimmed.substring(3);
                } else if (trimmed === '---') {
                    block.type = this.BLOCK_TYPES.DIVIDER;
                    block.content = '';
                }

                blocks.push(block);
            });

            return blocks;
        },

        /**
         * Escape HTML
         */
        _escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Generate unique block ID
         */
        _generateBlockId: function() {
            return 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    });
});
