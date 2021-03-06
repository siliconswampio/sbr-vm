"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSstoreGas = exports.writeCallOutput = exports.subMemUsage = exports.maxCallGas = exports.jumpSubIsValid = exports.jumpIsValid = exports.getFullname = exports.getDataSlice = exports.getContractStorage = exports.short = exports.divCeil = exports.describeLocation = exports.addressToBuffer = exports.trap = exports.setLengthLeftStorage = void 0;
var sbr_util_1 = require("sbr-util");
var exceptions_1 = require("./../../exceptions");
var EIP2929_1 = require("./EIP2929");
var MASK_160 = new sbr_util_1.BN(1).shln(160).subn(1);
/**
 * Proxy function for sbr-util's setLengthLeft, except it returns a zero
 *
 * length buffer in case the buffer is full of zeros.
 * @param {Buffer} value Buffer which we want to pad
 */
function setLengthLeftStorage(value) {
    if (value.equals(Buffer.alloc(value.length, 0))) {
        // return the empty buffer (the value is zero)
        return Buffer.alloc(0);
    }
    else {
        return sbr_util_1.setLengthLeft(value, 32);
    }
}
exports.setLengthLeftStorage = setLengthLeftStorage;
/**
 * Wraps error message as VMError
 *
 * @param {string} err
 */
function trap(err) {
    // TODO: facilitate extra data along with errors
    throw new exceptions_1.VmError(err);
}
exports.trap = trap;
/**
 * Converts BN address (they're stored like this on the stack) to buffer address
 *
 * @param  {BN}     address
 * @return {Buffer}
 */
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
exports.addressToBuffer = addressToBuffer;
/**
 * Error message helper - generates location string
 *
 * @param  {RunState} runState
 * @return {string}
 */
function describeLocation(runState) {
    var hash = sbr_util_1.keccak256(runState.eei.getCode()).toString('hex');
    var address = runState.eei.getAddress().buf.toString('hex');
    var pc = runState.programCounter - 1;
    return hash + "/" + address + ":" + pc;
}
exports.describeLocation = describeLocation;
/**
 * Find Ceil(a / b)
 *
 * @param {BN} a
 * @param {BN} b
 * @return {BN}
 */
function divCeil(a, b) {
    var div = a.div(b);
    var mod = a.mod(b);
    // Fast case - exact division
    if (mod.isZero())
        return div;
    // Round up
    return div.isNeg() ? div.isubn(1) : div.iaddn(1);
}
exports.divCeil = divCeil;
function short(buffer) {
    var MAX_LENGTH = 50;
    var bufferStr = buffer.toString('hex');
    if (bufferStr.length <= MAX_LENGTH) {
        return bufferStr;
    }
    return bufferStr.slice(0, MAX_LENGTH) + '...';
}
exports.short = short;
/**
 * Calls relevant stateManager.getContractStorage method based on hardfork
 *
 * @param {RunState} runState [description]
 * @param {Buffer}   address  [description]
 * @param {Buffer}   key      [description]
 * @return {Promise<Buffer>}
 */
function getContractStorage(runState, address, key) {
    return __awaiter(this, void 0, void 0, function () {
        var current, _a, original, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = setLengthLeftStorage;
                    return [4 /*yield*/, runState.stateManager.getContractStorage(address, key)];
                case 1:
                    current = _a.apply(void 0, [_c.sent()]);
                    if (!(runState._common.hardfork() === 'constantinople' ||
                        runState._common.gteHardfork('istanbul'))) return [3 /*break*/, 3];
                    _b = setLengthLeftStorage;
                    return [4 /*yield*/, runState.stateManager.getOriginalContractStorage(address, key)];
                case 2:
                    original = _b.apply(void 0, [_c.sent()]);
                    return [2 /*return*/, { current: current, original: original }];
                case 3: return [2 /*return*/, current];
            }
        });
    });
}
exports.getContractStorage = getContractStorage;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 *
 * @param {BN} offset
 * @param {BN} length
 * @param {Buffer} data
 * @returns {Buffer}
 */
function getDataSlice(data, offset, length) {
    var len = new sbr_util_1.BN(data.length);
    if (offset.gt(len)) {
        offset = len;
    }
    var end = offset.add(length);
    if (end.gt(len)) {
        end = len;
    }
    data = data.slice(offset.toNumber(), end.toNumber());
    // Right-pad with zeros to fill dataLength bytes
    data = sbr_util_1.setLengthRight(data, length.toNumber());
    return data;
}
exports.getDataSlice = getDataSlice;
/**
 * Get full opcode name from its name and code.
 *
 * @param code {number} Integer code of opcode.
 * @param name {string} Short name of the opcode.
 * @returns {string} Full opcode name
 */
function getFullname(code, name) {
    switch (name) {
        case 'LOG':
            name += code - 0xa0;
            break;
        case 'PUSH':
            name += code - 0x5f;
            break;
        case 'DUP':
            name += code - 0x7f;
            break;
        case 'SWAP':
            name += code - 0x8f;
            break;
    }
    return name;
}
exports.getFullname = getFullname;
/**
 * Checks if a jump is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
function jumpIsValid(runState, dest) {
    return runState.validJumps.indexOf(dest) !== -1;
}
exports.jumpIsValid = jumpIsValid;
/**
 * Checks if a jumpsub is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
function jumpSubIsValid(runState, dest) {
    return runState.validJumpSubs.indexOf(dest) !== -1;
}
exports.jumpSubIsValid = jumpSubIsValid;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 *
 * the data with zeros to `length`.
 * @param {BN} gasLimit - requested gas Limit
 * @param {BN} gasLeft - current gas left
 * @param {RunState} runState - the current runState
 */
function maxCallGas(gasLimit, gasLeft, runState) {
    var isTangerineWhistleOrLater = runState._common.gteHardfork('tangerineWhistle');
    if (isTangerineWhistleOrLater) {
        var gasAllowed = gasLeft.sub(gasLeft.divn(64));
        return gasLimit.gt(gasAllowed) ? gasAllowed : gasLimit;
    }
    else {
        return gasLimit;
    }
}
exports.maxCallGas = maxCallGas;
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 *
 * @method subMemUsage
 * @param {Object} runState
 * @param {BN} offset
 * @param {BN} length
 */
function subMemUsage(runState, offset, length) {
    // YP (225): access with zero length will not extend the memory
    if (length.isZero())
        return;
    var newMemoryWordCount = divCeil(offset.add(length), new sbr_util_1.BN(32));
    if (newMemoryWordCount.lte(runState.memoryWordCount))
        return;
    var words = newMemoryWordCount;
    var fee = new sbr_util_1.BN(runState._common.param('gasPrices', 'memory'));
    var quadCoeff = new sbr_util_1.BN(runState._common.param('gasPrices', 'quadCoeffDiv'));
    // words * 3 + words ^2 / 512
    var cost = words.mul(fee).add(words.mul(words).div(quadCoeff));
    if (cost.gt(runState.highestMemCost)) {
        runState.eei.useGas(cost.sub(runState.highestMemCost));
        runState.highestMemCost = cost;
    }
    runState.memoryWordCount = newMemoryWordCount;
}
exports.subMemUsage = subMemUsage;
/**
 * Writes data returned by eei.call* methods to memory
 *
 * @param {RunState} runState
 * @param {BN}       outOffset
 * @param {BN}       outLength
 */
function writeCallOutput(runState, outOffset, outLength) {
    var returnData = runState.eei.getReturnData();
    if (returnData.length > 0) {
        var memOffset = outOffset.toNumber();
        var dataLength = outLength.toNumber();
        if (returnData.length < dataLength) {
            dataLength = returnData.length;
        }
        var data = getDataSlice(returnData, new sbr_util_1.BN(0), new sbr_util_1.BN(dataLength));
        runState.memory.extend(memOffset, dataLength);
        runState.memory.write(memOffset, dataLength, data);
    }
}
exports.writeCallOutput = writeCallOutput;
/** The first rule set of SSTORE rules, which are the rules pre-Constantinople and in Petersburg
 * @param {RunState} runState
 * @param {any}      found
 * @param {Buffer}   value
 * @param {Buffer}   keyBuf
 */
function updateSstoreGas(runState, found, value, keyBuf) {
    var sstoreResetCost = runState._common.param('gasPrices', 'sstoreReset');
    if ((value.length === 0 && !found.length) || (value.length !== 0 && found.length)) {
        runState.eei.useGas(new sbr_util_1.BN(EIP2929_1.adjustSstoreGasEIP2929(runState, keyBuf, sstoreResetCost, 'reset')));
    }
    else if (value.length === 0 && found.length) {
        runState.eei.useGas(new sbr_util_1.BN(EIP2929_1.adjustSstoreGasEIP2929(runState, keyBuf, sstoreResetCost, 'reset')));
        runState.eei.refundGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sstoreRefund')));
    }
    else if (value.length !== 0 && !found.length) {
        runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sstoreSet')));
    }
}
exports.updateSstoreGas = updateSstoreGas;
//# sourceMappingURL=util.js.map