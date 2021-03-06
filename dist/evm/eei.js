"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sbr_util_1 = require("sbr-util");
const exceptions_1 = require("../exceptions");
const message_1 = __importDefault(require("./message"));
function trap(err) {
    throw new exceptions_1.VmError(err);
}
const MASK_160 = new sbr_util_1.BN(1).shln(160).subn(1);
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
/**
 * External interface made available to EVM bytecode. Modeled after
 * the ewasm EEI [spec](https://github.com/ewasm/design/blob/master/eth_interface.md).
 * It includes methods for accessing/modifying state, calling or creating contracts, access
 * to environment data among other things.
 * The EEI instance also keeps artifacts produced by the bytecode such as logs
 * and to-be-selfdestructed addresses.
 */
class EEI {
    constructor(env, state, evm, common, gasLeft) {
        this._env = env;
        this._state = state;
        this._evm = evm;
        this._lastReturned = Buffer.alloc(0);
        this._common = common;
        this._gasLeft = gasLeft;
        this._result = {
            logs: [],
            returnValue: undefined,
            selfdestruct: {},
        };
    }
    /**
     * Subtracts an amount from the gas counter.
     * @param amount - Amount of gas to consume
     * @param _context - Deprecated: this param doesn't do anything now.
     * @throws if out of gas
     */
    // eslint-disable-next-line no-unused-vars
    useGas(amount, _context) {
        this._gasLeft.isub(amount);
        if (this._gasLeft.ltn(0)) {
            this._gasLeft = new sbr_util_1.BN(0);
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
    }
    /**
     * Adds a positive amount to the gas counter.
     * @param amount - Amount of gas refunded
     * @param _context - Deprecated: this param doesn't do anything now.
     */
    // eslint-disable-next-line no-unused-vars
    refundGas(amount, _context) {
        this._evm._refund.iadd(amount);
    }
    /**
     * Reduces amount of gas to be refunded by a positive value.
     * @param amount - Amount to subtract from gas refunds
     * @param _context - Deprecated: this param doesn't do anything now.
     */
    // eslint-disable-next-line no-unused-vars
    subRefund(amount, _context) {
        this._evm._refund.isub(amount);
        if (this._evm._refund.ltn(0)) {
            this._evm._refund = new sbr_util_1.BN(0);
            trap(exceptions_1.ERROR.REFUND_EXHAUSTED);
        }
    }
    /**
     * Returns address of currently executing account.
     */
    getAddress() {
        return this._env.address;
    }
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    async getExternalBalance(address) {
        // shortcut if current account
        if (address.equals(this._env.address)) {
            return this._env.contract.balance;
        }
        // otherwise load account then return balance
        const account = await this._state.getAccount(address);
        return account.balance;
    }
    /**
     * Returns balance of self.
     */
    getSelfBalance() {
        return this._env.contract.balance;
    }
    /**
     * Returns caller address. This is the address of the account
     * that is directly responsible for this execution.
     */
    getCaller() {
        return new sbr_util_1.BN(this._env.caller.buf);
    }
    /**
     * Returns the deposited value by the instruction/transaction
     * responsible for this execution.
     */
    getCallValue() {
        return new sbr_util_1.BN(this._env.callValue);
    }
    /**
     * Returns input data in current environment. This pertains to the input
     * data passed with the message call instruction or transaction.
     */
    getCallData() {
        return this._env.callData;
    }
    /**
     * Returns size of input data in current environment. This pertains to the
     * input data passed with the message call instruction or transaction.
     */
    getCallDataSize() {
        return new sbr_util_1.BN(this._env.callData.length);
    }
    /**
     * Returns the size of code running in current environment.
     */
    getCodeSize() {
        return new sbr_util_1.BN(this._env.code.length);
    }
    /**
     * Returns the code running in current environment.
     */
    getCode() {
        return this._env.code;
    }
    /**
     * Returns true if the current call must be executed statically.
     */
    isStatic() {
        return this._env.isStatic;
    }
    /**
     * Get size of an account???s code.
     * @param address - Address of account
     */
    async getExternalCodeSize(address) {
        const addr = new sbr_util_1.Address(addressToBuffer(address));
        const code = await this._state.getContractCode(addr);
        return new sbr_util_1.BN(code.length);
    }
    /**
     * Returns code of an account.
     * @param address - Address of account
     */
    async getExternalCode(address) {
        const addr = new sbr_util_1.Address(addressToBuffer(address));
        return this._state.getContractCode(addr);
    }
    /**
     * Returns size of current return data buffer. This contains the return data
     * from the last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    getReturnDataSize() {
        return new sbr_util_1.BN(this._lastReturned.length);
    }
    /**
     * Returns the current return data buffer. This contains the return data
     * from last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    getReturnData() {
        return this._lastReturned;
    }
    /**
     * Returns price of gas in current environment.
     */
    getTxGasPrice() {
        return this._env.gasPrice;
    }
    /**
     * Returns the execution's origination address. This is the
     * sender of original transaction; it is never an account with
     * non-empty associated code.
     */
    getTxOrigin() {
        return new sbr_util_1.BN(this._env.origin.buf);
    }
    /**
     * Returns the block???s number.
     */
    getBlockNumber() {
        return this._env.block.header.number;
    }
    /**
     * Returns the block's beneficiary address.
     */
    getBlockCoinbase() {
        let coinbase;
        if (this._common.consensusAlgorithm() === 'clique') {
            // Backwards-compatibilty check
            // TODO: can be removed along VM v5 release
            if ('cliqueSigner' in this._env.block.header) {
                coinbase = this._env.block.header.cliqueSigner();
            }
            else {
                coinbase = sbr_util_1.Address.zero();
            }
        }
        else {
            coinbase = this._env.block.header.coinbase;
        }
        return new sbr_util_1.BN(coinbase.toBuffer());
    }
    /**
     * Returns the block's timestamp.
     */
    getBlockTimestamp() {
        return this._env.block.header.timestamp;
    }
    /**
     * Returns the block's difficulty.
     */
    getBlockDifficulty() {
        return this._env.block.header.difficulty;
    }
    /**
     * Returns the block's gas limit.
     */
    getBlockGasLimit() {
        return this._env.block.header.gasLimit;
    }
    /**
     * Returns the chain ID for current chain. Introduced for the
     * CHAINID opcode proposed in [EIP-1344](https://eips.ethereum.org/EIPS/eip-1344).
     */
    getChainId() {
        return this._common.chainIdBN();
    }
    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param num - Number of block
     */
    async getBlockHash(num) {
        const block = await this._env.blockchain.getBlock(num);
        return new sbr_util_1.BN(block.hash());
    }
    /**
     * Store 256-bit a value in memory to persistent storage.
     */
    async storageStore(key, value) {
        await this._state.putContractStorage(this._env.address, key, value);
        const account = await this._state.getAccount(this._env.address);
        this._env.contract = account;
    }
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param key - Storage key
     */
    async storageLoad(key) {
        return this._state.getContractStorage(this._env.address, key);
    }
    /**
     * Returns the current gasCounter.
     */
    getGasLeft() {
        return this._gasLeft.clone();
    }
    /**
     * Set the returning output data for the execution.
     * @param returnData - Output data to return
     */
    finish(returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.STOP);
    }
    /**
     * Set the returning output data for the execution. This will halt the
     * execution immediately and set the execution result to "reverted".
     * @param returnData - Output data to return
     */
    revert(returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.REVERT);
    }
    /**
     * Mark account for later deletion and give the remaining balance to the
     * specified beneficiary address. This will cause a trap and the
     * execution will be aborted immediately.
     * @param toAddress - Beneficiary address
     */
    async selfDestruct(toAddress) {
        return this._selfDestruct(toAddress);
    }
    async _selfDestruct(toAddress) {
        // only add to refund if this is the first selfdestruct for the address
        if (!this._result.selfdestruct[this._env.address.buf.toString('hex')]) {
            this.refundGas(new sbr_util_1.BN(this._common.param('gasPrices', 'selfdestructRefund')));
        }
        this._result.selfdestruct[this._env.address.buf.toString('hex')] = toAddress.buf;
        // Add to beneficiary balance
        const toAccount = await this._state.getAccount(toAddress);
        toAccount.balance.iadd(this._env.contract.balance);
        await this._state.putAccount(toAddress, toAccount);
        // Subtract from contract balance
        const account = await this._state.getAccount(this._env.address);
        account.balance = new sbr_util_1.BN(0);
        await this._state.putAccount(this._env.address, account);
        trap(exceptions_1.ERROR.STOP);
    }
    /**
     * Creates a new log in the current environment.
     */
    log(data, numberOfTopics, topics) {
        if (numberOfTopics < 0 || numberOfTopics > 4) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        if (topics.length !== numberOfTopics) {
            trap(exceptions_1.ERROR.INTERNAL_ERROR);
        }
        const log = [this._env.address.buf, topics, data];
        this._result.logs.push(log);
    }
    /**
     * Sends a message with arbitrary data to a given address path.
     */
    async call(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit,
            to: address,
            value,
            data,
            isStatic: this._env.isStatic,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    /**
     * Message-call into this account with an alternative account's code.
     */
    async callCode(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit,
            to: this._env.address,
            codeAddress: address,
            value,
            data,
            isStatic: this._env.isStatic,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    /**
     * Sends a message with arbitrary data to a given address path, but disallow
     * state modifications. This includes log, create, selfdestruct and call with
     * a non-zero value.
     */
    async callStatic(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit,
            to: address,
            value,
            data,
            isStatic: true,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    /**
     * Message-call into this account with an alternative account???s code, but
     * persisting the current values for sender and value.
     */
    async callDelegate(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.caller,
            gasLimit,
            to: this._env.address,
            codeAddress: address,
            value,
            data,
            isStatic: this._env.isStatic,
            delegatecall: true,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    async _baseCall(msg) {
        const selfdestruct = Object.assign({}, this._result.selfdestruct);
        msg.selfdestruct = selfdestruct;
        // empty the return data buffer
        this._lastReturned = Buffer.alloc(0);
        // Check if account has enough ether and max depth not exceeded
        if (this._env.depth >= this._common.param('vm', 'stackLimit') ||
            (msg.delegatecall !== true && this._env.contract.balance.lt(msg.value))) {
            return new sbr_util_1.BN(0);
        }
        const results = await this._evm.executeMessage(msg);
        if (results.execResult.logs) {
            this._result.logs = this._result.logs.concat(results.execResult.logs);
        }
        // this should always be safe
        this.useGas(results.gasUsed);
        // Set return value
        if (results.execResult.returnValue &&
            (!results.execResult.exceptionError ||
                results.execResult.exceptionError.error === exceptions_1.ERROR.REVERT)) {
            this._lastReturned = results.execResult.returnValue;
        }
        if (!results.execResult.exceptionError) {
            Object.assign(this._result.selfdestruct, selfdestruct);
            // update stateRoot on current contract
            const account = await this._state.getAccount(this._env.address);
            this._env.contract = account;
        }
        return this._getReturnCode(results);
    }
    /**
     * Creates a new contract with a given value.
     */
    async create(gasLimit, value, data, salt = null) {
        const selfdestruct = Object.assign({}, this._result.selfdestruct);
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit,
            value,
            data,
            salt,
            depth: this._env.depth + 1,
            selfdestruct,
        });
        // empty the return data buffer
        this._lastReturned = Buffer.alloc(0);
        // Check if account has enough ether and max depth not exceeded
        if (this._env.depth >= this._common.param('vm', 'stackLimit') ||
            (msg.delegatecall !== true && this._env.contract.balance.lt(msg.value))) {
            return new sbr_util_1.BN(0);
        }
        this._env.contract.nonce.iaddn(1);
        await this._state.putAccount(this._env.address, this._env.contract);
        const results = await this._evm.executeMessage(msg);
        if (results.execResult.logs) {
            this._result.logs = this._result.logs.concat(results.execResult.logs);
        }
        // this should always be safe
        this.useGas(results.gasUsed);
        // Set return buffer in case revert happened
        if (results.execResult.exceptionError &&
            results.execResult.exceptionError.error === exceptions_1.ERROR.REVERT) {
            this._lastReturned = results.execResult.returnValue;
        }
        if (!results.execResult.exceptionError ||
            results.execResult.exceptionError.error === exceptions_1.ERROR.CODESTORE_OUT_OF_GAS) {
            Object.assign(this._result.selfdestruct, selfdestruct);
            // update stateRoot on current contract
            const account = await this._state.getAccount(this._env.address);
            this._env.contract = account;
            if (results.createdAddress) {
                // push the created address to the stack
                return new sbr_util_1.BN(results.createdAddress.buf);
            }
        }
        return this._getReturnCode(results);
    }
    /**
     * Creates a new contract with a given value. Generates
     * a deterministic address via CREATE2 rules.
     */
    async create2(gasLimit, value, data, salt) {
        return this.create(gasLimit, value, data, salt);
    }
    /**
     * Returns true if account is empty or non-existent (according to EIP-161).
     * @param address - Address of account
     */
    async isAccountEmpty(address) {
        return this._state.accountIsEmpty(address);
    }
    /**
     * Returns true if account exists in the state trie (it can be empty). Returns false if the account is `null`.
     * @param address - Address of account
     */
    async accountExists(address) {
        return this._state.accountExists(address);
    }
    _getReturnCode(results) {
        // This preserves the previous logic, but seems to contradict the EEI spec
        // https://github.com/ewasm/design/blob/38eeded28765f3e193e12881ea72a6ab807a3371/eth_interface.md
        if (results.execResult.exceptionError) {
            return new sbr_util_1.BN(0);
        }
        else {
            return new sbr_util_1.BN(1);
        }
    }
}
exports.default = EEI;
//# sourceMappingURL=eei.js.map