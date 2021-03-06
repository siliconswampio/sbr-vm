"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VmErrorResult = exports.COOGResult = exports.OOGResult = void 0;
const sbr_util_1 = require("sbr-util");
const block_1 = require("@sbr/block");
const exceptions_1 = require("../exceptions");
const precompiles_1 = require("./precompiles");
const eei_1 = __importDefault(require("./eei"));
const interpreter_1 = __importDefault(require("./interpreter"));
function OOGResult(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasLimit,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.OUT_OF_GAS),
    };
}
exports.OOGResult = OOGResult;
// CodeDeposit OOG Result
function COOGResult(gasUsedCreateCode) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasUsedCreateCode,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CODESTORE_OUT_OF_GAS),
    };
}
exports.COOGResult = COOGResult;
function VmErrorResult(error, gasUsed) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasUsed,
        exceptionError: error,
    };
}
exports.VmErrorResult = VmErrorResult;
/**
 * EVM is responsible for executing an EVM message fully
 * (including any nested calls and creates), processing the results
 * and storing them to state (or discarding changes in case of exceptions).
 * @ignore
 */
class EVM {
    constructor(vm, txContext, block) {
        this._vm = vm;
        this._state = this._vm.stateManager;
        this._tx = txContext;
        this._block = block;
        this._refund = new sbr_util_1.BN(0);
    }
    /**
     * Executes an EVM message, determining whether it's a call or create
     * based on the `to` address. It checkpoints the state and reverts changes
     * if an exception happens during the message execution.
     */
    async executeMessage(message) {
        await this._vm._emit('beforeMessage', message);
        if (!message.to && this._vm._common.isActivatedEIP(2929)) {
            message.code = message.data;
            this._state.addWarmedAddress((await this._generateAddress(message)).buf);
        }
        await this._state.checkpoint();
        let result;
        if (message.to) {
            result = await this._executeCall(message);
        }
        else {
            result = await this._executeCreate(message);
        }
        // TODO: Move `gasRefund` to a tx-level result object
        // instead of `ExecResult`.
        result.execResult.gasRefund = this._refund.clone();
        const err = result.execResult.exceptionError;
        if (err) {
            if (this._vm._common.gteHardfork('homestead') || err.error != exceptions_1.ERROR.CODESTORE_OUT_OF_GAS) {
                result.execResult.logs = [];
                await this._state.revert();
            }
            else {
                // we are in chainstart and the error was the code deposit error
                // we do like nothing happened.
                await this._state.commit();
            }
        }
        else {
            await this._state.commit();
        }
        await this._vm._emit('afterMessage', result);
        return result;
    }
    async _executeCall(message) {
        const account = await this._state.getAccount(message.caller);
        // Reduce tx value from sender
        if (!message.delegatecall) {
            await this._reduceSenderBalance(account, message);
        }
        // Load `to` account
        const toAccount = await this._state.getAccount(message.to);
        // Add tx value to the `to` account
        let errorMessage;
        if (!message.delegatecall) {
            try {
                await this._addToBalance(toAccount, message);
            }
            catch (e) {
                errorMessage = e;
            }
        }
        // Load code
        await this._loadCode(message);
        let exit = false;
        if (!message.code || message.code.length === 0) {
            exit = true;
        }
        if (errorMessage) {
            exit = true;
        }
        if (exit) {
            return {
                gasUsed: new sbr_util_1.BN(0),
                execResult: {
                    gasUsed: new sbr_util_1.BN(0),
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        let result;
        if (message.isCompiled) {
            result = await this.runPrecompile(message.code, message.data, message.gasLimit);
        }
        else {
            result = await this.runInterpreter(message);
        }
        return {
            gasUsed: result.gasUsed,
            execResult: result,
        };
    }
    async _executeCreate(message) {
        const account = await this._state.getAccount(message.caller);
        // Reduce tx value from sender
        await this._reduceSenderBalance(account, message);
        message.code = message.data;
        message.data = Buffer.alloc(0);
        message.to = await this._generateAddress(message);
        let toAccount = await this._state.getAccount(message.to);
        // Check for collision
        if ((toAccount.nonce && toAccount.nonce.gtn(0)) || !toAccount.codeHash.equals(sbr_util_1.KECCAK256_NULL)) {
            return {
                gasUsed: message.gasLimit,
                createdAddress: message.to,
                execResult: {
                    returnValue: Buffer.alloc(0),
                    exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CREATE_COLLISION),
                    gasUsed: message.gasLimit,
                },
            };
        }
        await this._state.clearContractStorage(message.to);
        const newContractEvent = {
            address: message.to,
            code: message.code,
        };
        await this._vm._emit('newContract', newContractEvent);
        toAccount = await this._state.getAccount(message.to);
        // EIP-161 on account creation and CREATE execution
        if (this._vm._common.gteHardfork('spuriousDragon')) {
            toAccount.nonce.iaddn(1);
        }
        // Add tx value to the `to` account
        let errorMessage;
        try {
            await this._addToBalance(toAccount, message);
        }
        catch (e) {
            errorMessage = e;
        }
        let exit = false;
        if (!message.code || message.code.length === 0) {
            exit = true;
        }
        if (errorMessage) {
            exit = true;
        }
        if (exit) {
            return {
                gasUsed: new sbr_util_1.BN(0),
                createdAddress: message.to,
                execResult: {
                    gasUsed: new sbr_util_1.BN(0),
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        let result = await this.runInterpreter(message);
        // fee for size of the return value
        let totalGas = result.gasUsed;
        let returnFee = new sbr_util_1.BN(0);
        if (!result.exceptionError) {
            returnFee = new sbr_util_1.BN(result.returnValue.length).imuln(this._vm._common.param('gasPrices', 'createData'));
            totalGas = totalGas.add(returnFee);
        }
        // Check for SpuriousDragon EIP-170 code size limit
        let allowedCodeSize = true;
        if (this._vm._common.gteHardfork('spuriousDragon') &&
            result.returnValue.length > this._vm._common.param('vm', 'maxCodeSize')) {
            allowedCodeSize = false;
        }
        // If enough gas and allowed code size
        let CodestoreOOG = false;
        if (totalGas.lte(message.gasLimit) &&
            (this._vm._allowUnlimitedContractSize || allowedCodeSize)) {
            result.gasUsed = totalGas;
        }
        else {
            if (this._vm._common.gteHardfork('homestead')) {
                result = Object.assign(Object.assign({}, result), OOGResult(message.gasLimit));
            }
            else {
                // we are in Frontier
                if (totalGas.sub(returnFee).lte(message.gasLimit)) {
                    // we cannot pay the code deposit fee (but the deposit code actually did run)
                    result = Object.assign(Object.assign({}, result), COOGResult(totalGas.sub(returnFee)));
                    CodestoreOOG = true;
                }
                else {
                    result = Object.assign(Object.assign({}, result), OOGResult(message.gasLimit));
                }
            }
        }
        // Save code if a new contract was created
        if (!result.exceptionError && result.returnValue && result.returnValue.toString() !== '') {
            await this._state.putContractCode(message.to, result.returnValue);
        }
        else if (CodestoreOOG) {
            // This only happens at Frontier. But, let's do a sanity check;
            if (!this._vm._common.gteHardfork('homestead')) {
                // Pre-Homestead behavior; put an empty contract.
                // This contract would be considered "DEAD" in later hard forks.
                // It is thus an unecessary default item, which we have to save to dik
                // It does change the state root, but it only wastes storage.
                //await this._state.putContractCode(message.to, result.returnValue)
                const account = await this._state.getAccount(message.to);
                await this._state.putAccount(message.to, account);
            }
        }
        return {
            gasUsed: result.gasUsed,
            createdAddress: message.to,
            execResult: result,
        };
    }
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the [[EEI]].
     */
    async runInterpreter(message, opts = {}) {
        const env = {
            blockchain: this._vm.blockchain,
            address: message.to || sbr_util_1.Address.zero(),
            caller: message.caller || sbr_util_1.Address.zero(),
            callData: message.data || Buffer.from([0]),
            callValue: message.value || new sbr_util_1.BN(0),
            code: message.code,
            isStatic: message.isStatic || false,
            depth: message.depth || 0,
            gasPrice: this._tx.gasPrice,
            origin: this._tx.origin || message.caller || sbr_util_1.Address.zero(),
            block: this._block || new block_1.Block(),
            contract: await this._state.getAccount(message.to || sbr_util_1.Address.zero()),
            codeAddress: message.codeAddress,
        };
        const eei = new eei_1.default(env, this._state, this, this._vm._common, message.gasLimit.clone());
        if (message.selfdestruct) {
            eei._result.selfdestruct = message.selfdestruct;
        }
        const oldRefund = this._refund.clone();
        const interpreter = new interpreter_1.default(this._vm, eei);
        const interpreterRes = await interpreter.run(message.code, opts);
        let result = eei._result;
        let gasUsed = message.gasLimit.sub(eei._gasLeft);
        if (interpreterRes.exceptionError) {
            if (interpreterRes.exceptionError.error !== exceptions_1.ERROR.REVERT) {
                gasUsed = message.gasLimit;
            }
            // Clear the result on error
            result = Object.assign(Object.assign({}, result), { logs: [], selfdestruct: {} });
            // Revert gas refund if message failed
            this._refund = oldRefund;
        }
        return Object.assign(Object.assign({}, result), { runState: Object.assign(Object.assign(Object.assign({}, interpreterRes.runState), result), eei._env), exceptionError: interpreterRes.exceptionError, gas: eei._gasLeft, gasUsed, returnValue: result.returnValue ? result.returnValue : Buffer.alloc(0) });
    }
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    getPrecompile(address) {
        return precompiles_1.getPrecompile(address, this._vm._common);
    }
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    runPrecompile(code, data, gasLimit) {
        if (typeof code !== 'function') {
            throw new Error('Invalid precompile');
        }
        const opts = {
            data,
            gasLimit,
            _common: this._vm._common,
            _VM: this._vm,
        };
        return code(opts);
    }
    async _loadCode(message) {
        if (!message.code) {
            const precompile = this.getPrecompile(message.codeAddress);
            if (precompile) {
                message.code = precompile;
                message.isCompiled = true;
            }
            else {
                message.code = await this._state.getContractCode(message.codeAddress);
                message.isCompiled = false;
            }
        }
    }
    async _generateAddress(message) {
        let addr;
        if (message.salt) {
            addr = sbr_util_1.generateAddress2(message.caller.buf, message.salt, message.code);
        }
        else {
            const acc = await this._state.getAccount(message.caller);
            const newNonce = acc.nonce.subn(1);
            addr = sbr_util_1.generateAddress(message.caller.buf, newNonce.toArrayLike(Buffer));
        }
        return new sbr_util_1.Address(addr);
    }
    async _reduceSenderBalance(account, message) {
        account.balance.isub(message.value);
        const result = this._state.putAccount(message.caller, account);
        return result;
    }
    async _addToBalance(toAccount, message) {
        const newBalance = toAccount.balance.add(message.value);
        if (newBalance.gt(sbr_util_1.MAX_INTEGER)) {
            throw new exceptions_1.VmError(exceptions_1.ERROR.VALUE_OVERFLOW);
        }
        toAccount.balance = newBalance;
        // putAccount as the nonce may have changed for contract creation
        const result = this._state.putAccount(message.to, toAccount);
        return result;
    }
    async _touchAccount(address) {
        const account = await this._state.getAccount(address);
        return this._state.putAccount(address, account);
    }
}
exports.default = EVM;
//# sourceMappingURL=evm.js.map