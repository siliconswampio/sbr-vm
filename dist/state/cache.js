"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sbr_util_1 = require("sbr-util");
const Tree = require('functional-red-black-tree');
/**
 * @ignore
 */
class Cache {
    constructor(trie) {
        this._cache = Tree();
        this._checkpoints = [];
        this._trie = trie;
    }
    /**
     * Puts account to cache under its address.
     * @param key - Address of account
     * @param val - Account
     */
    put(key, val, fromTrie = false) {
        const modified = !fromTrie;
        this._update(key, val, modified, false);
    }
    /**
     * Returns the queried account or an empty account.
     * @param key - Address of account
     */
    get(key) {
        const account = this.lookup(key);
        return account || new sbr_util_1.Account();
    }
    /**
     * Returns the queried account or undefined.
     * @param key - Address of account
     */
    lookup(key) {
        const keyStr = key.buf.toString('hex');
        const it = this._cache.find(keyStr);
        if (it.node) {
            const rlp = it.value.val;
            return sbr_util_1.Account.fromRlpSerializedAccount(rlp);
        }
    }
    /**
     * Returns true if the key was deleted and thus existed in the cache earlier
     * @param key - trie key to lookup
     */
    keyIsDeleted(key) {
        const keyStr = key.buf.toString('hex');
        const it = this._cache.find(keyStr);
        if (it.node) {
            return it.value.deleted;
        }
        return false;
    }
    /**
     * Looks up address in underlying trie.
     * @param address - Address of account
     */
    async _lookupAccount(address) {
        const rlp = await this._trie.get(address.buf);
        return rlp ? sbr_util_1.Account.fromRlpSerializedAccount(rlp) : new sbr_util_1.Account();
    }
    /**
     * Looks up address in cache, if not found, looks it up
     * in the underlying trie.
     * @param key - Address of account
     */
    async getOrLoad(address) {
        let account = this.lookup(address);
        if (!account) {
            account = await this._lookupAccount(address);
            this._update(address, account, false, false);
        }
        return account;
    }
    /**
     * Warms cache by loading their respective account from trie
     * and putting them in cache.
     * @param addresses - Array of addresses
     */
    async warm(addresses) {
        for (const addressHex of addresses) {
            if (addressHex) {
                const address = new sbr_util_1.Address(Buffer.from(addressHex, 'hex'));
                const account = await this._lookupAccount(address);
                this._update(address, account, false, false);
            }
        }
    }
    /**
     * Flushes cache by updating accounts that have been modified
     * and removing accounts that have been deleted.
     */
    async flush() {
        const it = this._cache.begin;
        let next = true;
        while (next) {
            if (it.value && it.value.modified) {
                it.value.modified = false;
                const accountRlp = it.value.val;
                const keyBuf = Buffer.from(it.key, 'hex');
                await this._trie.put(keyBuf, accountRlp);
                next = it.hasNext;
                it.next();
            }
            else if (it.value && it.value.deleted) {
                it.value.modified = false;
                it.value.deleted = true;
                it.value.val = new sbr_util_1.Account().serialize();
                const keyBuf = Buffer.from(it.key, 'hex');
                await this._trie.del(keyBuf);
                next = it.hasNext;
                it.next();
            }
            else {
                next = it.hasNext;
                it.next();
            }
        }
    }
    /**
     * Marks current state of cache as checkpoint, which can
     * later on be reverted or commited.
     */
    checkpoint() {
        this._checkpoints.push(this._cache);
    }
    /**
     * Revert changes to cache last checkpoint (no effect on trie).
     */
    revert() {
        this._cache = this._checkpoints.pop();
    }
    /**
     * Commits to current state of cache (no effect on trie).
     */
    commit() {
        this._checkpoints.pop();
    }
    /**
     * Clears cache.
     */
    clear() {
        this._cache = Tree();
    }
    /**
     * Marks address as deleted in cache.
     * @param key - Address
     */
    del(key) {
        this._update(key, new sbr_util_1.Account(), false, true);
    }
    _update(key, value, modified, deleted) {
        const keyHex = key.buf.toString('hex');
        const it = this._cache.find(keyHex);
        const val = value.serialize();
        if (it.node) {
            this._cache = it.update({ val, modified, deleted });
        }
        else {
            this._cache = this._cache.insert(keyHex, { val, modified, deleted });
        }
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map