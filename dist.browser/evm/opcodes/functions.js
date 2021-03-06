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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
var sbr_util_1 = require("sbr-util");
var util_1 = require("./util");
var EIP1283_1 = require("./EIP1283");
var EIP2200_1 = require("./EIP2200");
var EIP2929_1 = require("./EIP2929");
var exceptions_1 = require("../../exceptions");
// the opcode functions
exports.handlers = new Map([
    // 0x00: STOP
    [
        0x00,
        function () {
            util_1.trap(exceptions_1.ERROR.STOP);
        },
    ],
    // 0x01: ADD
    [
        0x01,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.add(b).mod(sbr_util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x02: MUL
    [
        0x02,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.mul(b).mod(sbr_util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x03: SUB
    [
        0x03,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.sub(b).toTwos(256);
            runState.stack.push(r);
        },
    ],
    // 0x04: DIV
    [
        0x04,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r;
            if (b.isZero()) {
                r = new sbr_util_1.BN(b);
            }
            else {
                r = a.div(b);
            }
            runState.stack.push(r);
        },
    ],
    // 0x05: SDIV
    [
        0x05,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r;
            if (b.isZero()) {
                r = new sbr_util_1.BN(b);
            }
            else {
                a = a.fromTwos(256);
                b = b.fromTwos(256);
                r = a.div(b).toTwos(256);
            }
            runState.stack.push(r);
        },
    ],
    // 0x06: MOD
    [
        0x06,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r;
            if (b.isZero()) {
                r = new sbr_util_1.BN(b);
            }
            else {
                r = a.mod(b);
            }
            runState.stack.push(r);
        },
    ],
    // 0x07: SMOD
    [
        0x07,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r;
            if (b.isZero()) {
                r = new sbr_util_1.BN(b);
            }
            else {
                a = a.fromTwos(256);
                b = b.fromTwos(256);
                r = a.abs().mod(b.abs());
                if (a.isNeg()) {
                    r = r.ineg();
                }
                r = r.toTwos(256);
            }
            runState.stack.push(r);
        },
    ],
    // 0x08: ADDMOD
    [
        0x08,
        function (runState) {
            var _a = __read(runState.stack.popN(3), 3), a = _a[0], b = _a[1], c = _a[2];
            var r;
            if (c.isZero()) {
                r = new sbr_util_1.BN(c);
            }
            else {
                r = a.add(b).mod(c);
            }
            runState.stack.push(r);
        },
    ],
    // 0x09: MULMOD
    [
        0x09,
        function (runState) {
            var _a = __read(runState.stack.popN(3), 3), a = _a[0], b = _a[1], c = _a[2];
            var r;
            if (c.isZero()) {
                r = new sbr_util_1.BN(c);
            }
            else {
                r = a.mul(b).mod(c);
            }
            runState.stack.push(r);
        },
    ],
    // 0x0a: EXP
    [
        0x0a,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), base = _a[0], exponent = _a[1];
            if (exponent.isZero()) {
                runState.stack.push(new sbr_util_1.BN(1));
                return;
            }
            var byteLength = exponent.byteLength();
            if (byteLength < 1 || byteLength > 32) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_RANGE);
            }
            var gasPrice = runState._common.param('gasPrices', 'expByte');
            var amount = new sbr_util_1.BN(byteLength).muln(gasPrice);
            runState.eei.useGas(amount);
            if (base.isZero()) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            var m = sbr_util_1.BN.red(sbr_util_1.TWO_POW256);
            var redBase = base.toRed(m);
            var r = redBase.redPow(exponent);
            runState.stack.push(r.fromRed());
        },
    ],
    // 0x0b: SIGNEXTEND
    [
        0x0b,
        function (runState) {
            /* eslint-disable-next-line prefer-const */
            var _a = __read(runState.stack.popN(2), 2), k = _a[0], val = _a[1];
            if (k.ltn(31)) {
                var signBit = k.muln(8).iaddn(7).toNumber();
                var mask = new sbr_util_1.BN(1).ishln(signBit).isubn(1);
                if (val.testn(signBit)) {
                    val = val.or(mask.notn(256));
                }
                else {
                    val = val.and(mask);
                }
            }
            else {
                // return the same value
                val = new sbr_util_1.BN(val);
            }
            runState.stack.push(val);
        },
    ],
    // 0x10 range - bit ops
    // 0x10: LT
    [
        0x10,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = new sbr_util_1.BN(a.lt(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x11: GT
    [
        0x11,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = new sbr_util_1.BN(a.gt(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x12: SLT
    [
        0x12,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = new sbr_util_1.BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x13: SGT
    [
        0x13,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = new sbr_util_1.BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x14: EQ
    [
        0x14,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = new sbr_util_1.BN(a.eq(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x15: ISZERO
    [
        0x15,
        function (runState) {
            var a = runState.stack.pop();
            var r = new sbr_util_1.BN(a.isZero() ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x16: AND
    [
        0x16,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.and(b);
            runState.stack.push(r);
        },
    ],
    // 0x17: OR
    [
        0x17,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.or(b);
            runState.stack.push(r);
        },
    ],
    // 0x18: XOR
    [
        0x18,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r = a.xor(b);
            runState.stack.push(r);
        },
    ],
    // 0x19: NOT
    [
        0x19,
        function (runState) {
            var a = runState.stack.pop();
            var r = a.notn(256);
            runState.stack.push(r);
        },
    ],
    // 0x1a: BYTE
    [
        0x1a,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), pos = _a[0], word = _a[1];
            if (pos.gten(32)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            var r = new sbr_util_1.BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff));
            runState.stack.push(r);
        },
    ],
    // 0x1b: SHL
    [
        0x1b,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            if (a.gten(256)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            var r = b.shln(a.toNumber()).iand(sbr_util_1.MAX_INTEGER);
            runState.stack.push(r);
        },
    ],
    // 0x1c: SHR
    [
        0x1c,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            if (a.gten(256)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            var r = b.shrn(a.toNumber());
            runState.stack.push(r);
        },
    ],
    // 0x1d: SAR
    [
        0x1d,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), a = _a[0], b = _a[1];
            var r;
            var isSigned = b.testn(255);
            if (a.gten(256)) {
                if (isSigned) {
                    r = new sbr_util_1.BN(sbr_util_1.MAX_INTEGER);
                }
                else {
                    r = new sbr_util_1.BN(0);
                }
                runState.stack.push(r);
                return;
            }
            var c = b.shrn(a.toNumber());
            if (isSigned) {
                var shiftedOutWidth = 255 - a.toNumber();
                var mask = sbr_util_1.MAX_INTEGER.shrn(shiftedOutWidth).shln(shiftedOutWidth);
                r = c.ior(mask);
            }
            else {
                r = c;
            }
            runState.stack.push(r);
        },
    ],
    // 0x20 range - crypto
    // 0x20: SHA3
    [
        0x20,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), offset = _a[0], length = _a[1];
            util_1.subMemUsage(runState, offset, length);
            var data = Buffer.alloc(0);
            if (!length.isZero()) {
                data = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            // copy fee
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sha3Word')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            var r = new sbr_util_1.BN(sbr_util_1.keccak256(data));
            runState.stack.push(r);
        },
    ],
    // 0x30 range - closure state
    // 0x30: ADDRESS
    [
        0x30,
        function (runState) {
            var address = new sbr_util_1.BN(runState.eei.getAddress().buf);
            runState.stack.push(address);
        },
    ],
    // 0x31: BALANCE
    [
        0x31,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var addressBN, address, balance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            addressBN = runState.stack.pop();
                            address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
                            EIP2929_1.accessAddressEIP2929(runState, address);
                            return [4 /*yield*/, runState.eei.getExternalBalance(address)];
                        case 1:
                            balance = _a.sent();
                            runState.stack.push(balance);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x32: ORIGIN
    [
        0x32,
        function (runState) {
            runState.stack.push(runState.eei.getTxOrigin());
        },
    ],
    // 0x33: CALLER
    [
        0x33,
        function (runState) {
            runState.stack.push(runState.eei.getCaller());
        },
    ],
    // 0x34: CALLVALUE
    [
        0x34,
        function (runState) {
            runState.stack.push(runState.eei.getCallValue());
        },
    ],
    // 0x35: CALLDATALOAD
    [
        0x35,
        function (runState) {
            var pos = runState.stack.pop();
            if (pos.gt(runState.eei.getCallDataSize())) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            var i = pos.toNumber();
            var loaded = runState.eei.getCallData().slice(i, i + 32);
            loaded = loaded.length ? loaded : Buffer.from([0]);
            var r = new sbr_util_1.BN(sbr_util_1.setLengthRight(loaded, 32));
            runState.stack.push(r);
        },
    ],
    // 0x36: CALLDATASIZE
    [
        0x36,
        function (runState) {
            var r = runState.eei.getCallDataSize();
            runState.stack.push(r);
        },
    ],
    // 0x37: CALLDATACOPY
    [
        0x37,
        function (runState) {
            var _a = __read(runState.stack.popN(3), 3), memOffset = _a[0], dataOffset = _a[1], dataLength = _a[2];
            util_1.subMemUsage(runState, memOffset, dataLength);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(dataLength, new sbr_util_1.BN(32))));
            var data = util_1.getDataSlice(runState.eei.getCallData(), dataOffset, dataLength);
            var memOffsetNum = memOffset.toNumber();
            var dataLengthNum = dataLength.toNumber();
            runState.memory.extend(memOffsetNum, dataLengthNum);
            runState.memory.write(memOffsetNum, dataLengthNum, data);
        },
    ],
    // 0x38: CODESIZE
    [
        0x38,
        function (runState) {
            runState.stack.push(runState.eei.getCodeSize());
        },
    ],
    // 0x39: CODECOPY
    [
        0x39,
        function (runState) {
            var _a = __read(runState.stack.popN(3), 3), memOffset = _a[0], codeOffset = _a[1], length = _a[2];
            util_1.subMemUsage(runState, memOffset, length);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            var data = util_1.getDataSlice(runState.eei.getCode(), codeOffset, length);
            var memOffsetNum = memOffset.toNumber();
            var lengthNum = length.toNumber();
            runState.memory.extend(memOffsetNum, lengthNum);
            runState.memory.write(memOffsetNum, lengthNum, data);
        },
    ],
    // 0x3b: EXTCODESIZE
    [
        0x3b,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var addressBN, address, size;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            addressBN = runState.stack.pop();
                            address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
                            EIP2929_1.accessAddressEIP2929(runState, address);
                            return [4 /*yield*/, runState.eei.getExternalCodeSize(addressBN)];
                        case 1:
                            size = _a.sent();
                            runState.stack.push(size);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x3c: EXTCODECOPY
    [
        0x3c,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, addressBN, memOffset, codeOffset, length, address, code, data, memOffsetNum, lengthNum;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = __read(runState.stack.popN(4), 4), addressBN = _a[0], memOffset = _a[1], codeOffset = _a[2], length = _a[3];
                            // FIXME: for some reason this must come before subGas
                            util_1.subMemUsage(runState, memOffset, length);
                            address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
                            EIP2929_1.accessAddressEIP2929(runState, address);
                            // copy fee
                            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
                            return [4 /*yield*/, runState.eei.getExternalCode(addressBN)];
                        case 1:
                            code = _b.sent();
                            data = util_1.getDataSlice(code, codeOffset, length);
                            memOffsetNum = memOffset.toNumber();
                            lengthNum = length.toNumber();
                            runState.memory.extend(memOffsetNum, lengthNum);
                            runState.memory.write(memOffsetNum, lengthNum, data);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x3f: EXTCODEHASH
    [
        0x3f,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var addressBN, address, empty, code;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            addressBN = runState.stack.pop();
                            address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
                            EIP2929_1.accessAddressEIP2929(runState, address);
                            return [4 /*yield*/, runState.eei.isAccountEmpty(address)];
                        case 1:
                            empty = _a.sent();
                            if (empty) {
                                runState.stack.push(new sbr_util_1.BN(0));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, runState.eei.getExternalCode(addressBN)];
                        case 2:
                            code = _a.sent();
                            if (code.length === 0) {
                                runState.stack.push(new sbr_util_1.BN(sbr_util_1.KECCAK256_NULL));
                                return [2 /*return*/];
                            }
                            runState.stack.push(new sbr_util_1.BN(sbr_util_1.keccak256(code)));
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x3d: RETURNDATASIZE
    [
        0x3d,
        function (runState) {
            runState.stack.push(runState.eei.getReturnDataSize());
        },
    ],
    // 0x3e: RETURNDATACOPY
    [
        0x3e,
        function (runState) {
            var _a = __read(runState.stack.popN(3), 3), memOffset = _a[0], returnDataOffset = _a[1], length = _a[2];
            if (returnDataOffset.add(length).gt(runState.eei.getReturnDataSize())) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
            }
            util_1.subMemUsage(runState, memOffset, length);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).mul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            var data = util_1.getDataSlice(runState.eei.getReturnData(), returnDataOffset, length);
            var memOffsetNum = memOffset.toNumber();
            var lengthNum = length.toNumber();
            runState.memory.extend(memOffsetNum, lengthNum);
            runState.memory.write(memOffsetNum, lengthNum, data);
        },
    ],
    // 0x3a: GASPRICE
    [
        0x3a,
        function (runState) {
            runState.stack.push(runState.eei.getTxGasPrice());
        },
    ],
    // '0x40' range - block operations
    // 0x40: BLOCKHASH
    [
        0x40,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var number, diff, hash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            number = runState.stack.pop();
                            diff = runState.eei.getBlockNumber().sub(number);
                            // block lookups must be within the past 256 blocks
                            if (diff.gtn(256) || diff.lten(0)) {
                                runState.stack.push(new sbr_util_1.BN(0));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, runState.eei.getBlockHash(number)];
                        case 1:
                            hash = _a.sent();
                            runState.stack.push(hash);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x41: COINBASE
    [
        0x41,
        function (runState) {
            runState.stack.push(runState.eei.getBlockCoinbase());
        },
    ],
    // 0x42: TIMESTAMP
    [
        0x42,
        function (runState) {
            runState.stack.push(runState.eei.getBlockTimestamp());
        },
    ],
    // 0x43: NUMBER
    [
        0x43,
        function (runState) {
            runState.stack.push(runState.eei.getBlockNumber());
        },
    ],
    // 0x44: DIFFICULTY
    [
        0x44,
        function (runState) {
            runState.stack.push(runState.eei.getBlockDifficulty());
        },
    ],
    // 0x45: GASLIMIT
    [
        0x45,
        function (runState) {
            runState.stack.push(runState.eei.getBlockGasLimit());
        },
    ],
    // 0x46: CHAINID
    [
        0x46,
        function (runState) {
            runState.stack.push(runState.eei.getChainId());
        },
    ],
    // 0x47: SELFBALANCE
    [
        0x47,
        function (runState) {
            runState.stack.push(runState.eei.getSelfBalance());
        },
    ],
    // 0x50 range - 'storage' and execution
    // 0x50: POP
    [
        0x50,
        function (runState) {
            runState.stack.pop();
        },
    ],
    // 0x51: MLOAD
    [
        0x51,
        function (runState) {
            var pos = runState.stack.pop();
            util_1.subMemUsage(runState, pos, new sbr_util_1.BN(32));
            var word = runState.memory.read(pos.toNumber(), 32);
            runState.stack.push(new sbr_util_1.BN(word));
        },
    ],
    // 0x52: MSTORE
    [
        0x52,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), offset = _a[0], word = _a[1];
            var buf = word.toArrayLike(Buffer, 'be', 32);
            util_1.subMemUsage(runState, offset, new sbr_util_1.BN(32));
            var offsetNum = offset.toNumber();
            runState.memory.extend(offsetNum, 32);
            runState.memory.write(offsetNum, 32, buf);
        },
    ],
    // 0x53: MSTORE8
    [
        0x53,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), offset = _a[0], byte = _a[1];
            // NOTE: we're using a 'trick' here to get the least significant byte
            // NOTE: force cast necessary because `BN.andln` returns number but
            // the types are wrong
            var buf = Buffer.from([byte.andln(0xff)]);
            util_1.subMemUsage(runState, offset, new sbr_util_1.BN(1));
            var offsetNum = offset.toNumber();
            runState.memory.extend(offsetNum, 1);
            runState.memory.write(offsetNum, 1, buf);
        },
    ],
    // 0x54: SLOAD
    [
        0x54,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var key, keyBuf, value, valueBN;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = runState.stack.pop();
                            keyBuf = key.toArrayLike(Buffer, 'be', 32);
                            EIP2929_1.accessStorageEIP2929(runState, keyBuf, false);
                            return [4 /*yield*/, runState.eei.storageLoad(keyBuf)];
                        case 1:
                            value = _a.sent();
                            valueBN = value.length ? new sbr_util_1.BN(value) : new sbr_util_1.BN(0);
                            runState.stack.push(valueBN);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x55: SSTORE
    [
        0x55,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, key, val, keyBuf, value, found;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (runState.eei.isStatic()) {
                                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                            }
                            _a = __read(runState.stack.popN(2), 2), key = _a[0], val = _a[1];
                            keyBuf = key.toArrayLike(Buffer, 'be', 32);
                            if (val.isZero()) {
                                value = Buffer.from([]);
                            }
                            else {
                                value = val.toArrayLike(Buffer, 'be');
                            }
                            return [4 /*yield*/, util_1.getContractStorage(runState, runState.eei.getAddress(), keyBuf)];
                        case 1:
                            found = _b.sent();
                            if (runState._common.hardfork() === 'constantinople') {
                                EIP1283_1.updateSstoreGasEIP1283(runState, found, util_1.setLengthLeftStorage(value));
                            }
                            else if (runState._common.gteHardfork('istanbul')) {
                                EIP2200_1.updateSstoreGasEIP2200(runState, found, util_1.setLengthLeftStorage(value), keyBuf);
                            }
                            else {
                                util_1.updateSstoreGas(runState, found, util_1.setLengthLeftStorage(value), keyBuf);
                            }
                            // We have to do this after the Istanbul (EIP2200) checks.
                            // Otherwise, we might run out of gas, due to "sentry check" of 2300 gas, if we deduct extra gas first.
                            EIP2929_1.accessStorageEIP2929(runState, keyBuf, true);
                            return [4 /*yield*/, runState.eei.storageStore(keyBuf, value)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x56: JUMP
    [
        0x56,
        function (runState) {
            var dest = runState.stack.pop();
            if (dest.gt(runState.eei.getCodeSize())) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
            }
            var destNum = dest.toNumber();
            if (!util_1.jumpIsValid(runState, destNum)) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
            }
            runState.programCounter = destNum;
        },
    ],
    // 0x57: JUMPI
    [
        0x57,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), dest = _a[0], cond = _a[1];
            if (!cond.isZero()) {
                if (dest.gt(runState.eei.getCodeSize())) {
                    util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
                }
                var destNum = dest.toNumber();
                if (!util_1.jumpIsValid(runState, destNum)) {
                    util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
                }
                runState.programCounter = destNum;
            }
        },
    ],
    // 0x58: PC
    [
        0x58,
        function (runState) {
            runState.stack.push(new sbr_util_1.BN(runState.programCounter - 1));
        },
    ],
    // 0x59: MSIZE
    [
        0x59,
        function (runState) {
            runState.stack.push(runState.memoryWordCount.muln(32));
        },
    ],
    // 0x5a: GAS
    [
        0x5a,
        function (runState) {
            runState.stack.push(new sbr_util_1.BN(runState.eei.getGasLeft()));
        },
    ],
    // 0x5b: JUMPDEST
    [0x5b, function () { }],
    // 0x5c: BEGINSUB
    [
        0x5c,
        function (runState) {
            util_1.trap(exceptions_1.ERROR.INVALID_BEGINSUB + ' at ' + util_1.describeLocation(runState));
        },
    ],
    // 0x5d: RETURNSUB
    [
        0x5d,
        function (runState) {
            if (runState.returnStack.length < 1) {
                util_1.trap(exceptions_1.ERROR.INVALID_RETURNSUB);
            }
            var dest = runState.returnStack.pop();
            runState.programCounter = dest.toNumber();
        },
    ],
    // 0x5e: JUMPSUB
    [
        0x5e,
        function (runState) {
            var dest = runState.stack.pop();
            if (dest.gt(runState.eei.getCodeSize())) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMPSUB + ' at ' + util_1.describeLocation(runState));
            }
            var destNum = dest.toNumber();
            if (!util_1.jumpSubIsValid(runState, destNum)) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMPSUB + ' at ' + util_1.describeLocation(runState));
            }
            runState.returnStack.push(new sbr_util_1.BN(runState.programCounter));
            runState.programCounter = destNum + 1;
        },
    ],
    // 0x60: PUSH
    [
        0x60,
        function (runState) {
            var numToPush = runState.opCode - 0x5f;
            var loaded = new sbr_util_1.BN(runState.eei.getCode().slice(runState.programCounter, runState.programCounter + numToPush));
            runState.programCounter += numToPush;
            runState.stack.push(loaded);
        },
    ],
    // 0x80: DUP
    [
        0x80,
        function (runState) {
            var stackPos = runState.opCode - 0x7f;
            runState.stack.dup(stackPos);
        },
    ],
    // 0x90: SWAP
    [
        0x90,
        function (runState) {
            var stackPos = runState.opCode - 0x8f;
            runState.stack.swap(stackPos);
        },
    ],
    // 0xa0: LOG
    [
        0xa0,
        function (runState) {
            if (runState.eei.isStatic()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            var _a = __read(runState.stack.popN(2), 2), memOffset = _a[0], memLength = _a[1];
            var topicsCount = runState.opCode - 0xa0;
            if (topicsCount < 0 || topicsCount > 4) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_RANGE);
            }
            var topics = runState.stack.popN(topicsCount);
            var topicsBuf = topics.map(function (a) {
                return a.toArrayLike(Buffer, 'be', 32);
            });
            util_1.subMemUsage(runState, memOffset, memLength);
            var mem = Buffer.alloc(0);
            if (!memLength.isZero()) {
                mem = runState.memory.read(memOffset.toNumber(), memLength.toNumber());
            }
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'logTopic'))
                .imuln(topicsCount)
                .iadd(memLength.muln(runState._common.param('gasPrices', 'logData'))));
            runState.eei.log(mem, topicsCount, topicsBuf);
        },
    ],
    // '0xf0' range - closures
    // 0xf0: CREATE
    [
        0xf0,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, value, offset, length, gasLimit, data, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (runState.eei.isStatic()) {
                                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                            }
                            _a = __read(runState.stack.popN(3), 3), value = _a[0], offset = _a[1], length = _a[2];
                            EIP2929_1.accessAddressEIP2929(runState, runState.eei.getAddress(), false);
                            util_1.subMemUsage(runState, offset, length);
                            gasLimit = new sbr_util_1.BN(runState.eei.getGasLeft());
                            gasLimit = util_1.maxCallGas(gasLimit, runState.eei.getGasLeft(), runState);
                            data = Buffer.alloc(0);
                            if (!length.isZero()) {
                                data = runState.memory.read(offset.toNumber(), length.toNumber());
                            }
                            return [4 /*yield*/, runState.eei.create(gasLimit, value, data)];
                        case 1:
                            ret = _b.sent();
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0xf5: CREATE2
    [
        0xf5,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, value, offset, length, salt, gasLimit, data, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (runState.eei.isStatic()) {
                                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                            }
                            _a = __read(runState.stack.popN(4), 4), value = _a[0], offset = _a[1], length = _a[2], salt = _a[3];
                            util_1.subMemUsage(runState, offset, length);
                            EIP2929_1.accessAddressEIP2929(runState, runState.eei.getAddress(), false);
                            // Deduct gas costs for hashing
                            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sha3Word')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
                            gasLimit = new sbr_util_1.BN(runState.eei.getGasLeft());
                            gasLimit = util_1.maxCallGas(gasLimit, runState.eei.getGasLeft(), runState); // CREATE2 is only available after TangerineWhistle (Constantinople introduced this opcode)
                            data = Buffer.alloc(0);
                            if (!length.isZero()) {
                                data = runState.memory.read(offset.toNumber(), length.toNumber());
                            }
                            return [4 /*yield*/, runState.eei.create2(gasLimit, value, data, salt.toArrayLike(Buffer, 'be', 32))];
                        case 1:
                            ret = _b.sent();
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0xf1: CALL
    [
        0xf1,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength, toAddress, data, gasLimit, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = __read(runState.stack.popN(7), 7), currentGasLimit = _a[0], toAddr = _a[1], value = _a[2], inOffset = _a[3], inLength = _a[4], outOffset = _a[5], outLength = _a[6];
                            toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
                            if (runState.eei.isStatic() && !value.isZero()) {
                                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                            }
                            util_1.subMemUsage(runState, inOffset, inLength);
                            util_1.subMemUsage(runState, outOffset, outLength);
                            EIP2929_1.accessAddressEIP2929(runState, toAddress);
                            if (!value.isZero()) {
                                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callValueTransfer')));
                            }
                            data = Buffer.alloc(0);
                            if (!inLength.isZero()) {
                                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                            }
                            if (!runState._common.gteHardfork('spuriousDragon')) return [3 /*break*/, 2];
                            return [4 /*yield*/, runState.eei.isAccountEmpty(toAddress)];
                        case 1:
                            // We are at or after Spurious Dragon
                            // Call new account gas: account is DEAD and we transfer nonzero value
                            if ((_b.sent()) && !value.isZero()) {
                                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
                            }
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, runState.eei.accountExists(toAddress)];
                        case 3:
                            if (!(_b.sent())) {
                                // We are before Spurious Dragon and the account does not exist.
                                // Call new account gas: account does not exist (it is not in the state trie, not even as an "empty" account)
                                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
                            }
                            _b.label = 4;
                        case 4:
                            gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
                            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
                            if (gasLimit.gt(runState.eei.getGasLeft())) {
                                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
                            }
                            if (!value.isZero()) {
                                // TODO: Don't use private attr directly
                                runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                                gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
                            }
                            return [4 /*yield*/, runState.eei.call(gasLimit, toAddress, value, data)
                                // Write return data to memory
                            ];
                        case 5:
                            ret = _b.sent();
                            // Write return data to memory
                            util_1.writeCallOutput(runState, outOffset, outLength);
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0xf2: CALLCODE
    [
        0xf2,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength, toAddress, gasLimit, data, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = __read(runState.stack.popN(7), 7), currentGasLimit = _a[0], toAddr = _a[1], value = _a[2], inOffset = _a[3], inLength = _a[4], outOffset = _a[5], outLength = _a[6];
                            toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
                            util_1.subMemUsage(runState, inOffset, inLength);
                            util_1.subMemUsage(runState, outOffset, outLength);
                            EIP2929_1.accessAddressEIP2929(runState, toAddress);
                            if (!value.isZero()) {
                                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callValueTransfer')));
                            }
                            gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
                            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
                            if (gasLimit.gt(runState.eei.getGasLeft())) {
                                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
                            }
                            if (!value.isZero()) {
                                // TODO: Don't use private attr directly
                                runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                                gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
                            }
                            data = Buffer.alloc(0);
                            if (!inLength.isZero()) {
                                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                            }
                            return [4 /*yield*/, runState.eei.callCode(gasLimit, toAddress, value, data)
                                // Write return data to memory
                            ];
                        case 1:
                            ret = _b.sent();
                            // Write return data to memory
                            util_1.writeCallOutput(runState, outOffset, outLength);
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0xf4: DELEGATECALL
    [
        0xf4,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var value, _a, currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength, toAddress, gasLimit, data, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            value = runState.eei.getCallValue();
                            _a = __read(runState.stack.popN(6), 6), currentGasLimit = _a[0], toAddr = _a[1], inOffset = _a[2], inLength = _a[3], outOffset = _a[4], outLength = _a[5];
                            toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
                            util_1.subMemUsage(runState, inOffset, inLength);
                            util_1.subMemUsage(runState, outOffset, outLength);
                            EIP2929_1.accessAddressEIP2929(runState, toAddress);
                            gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
                            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
                            if (gasLimit.gt(runState.eei.getGasLeft())) {
                                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
                            }
                            data = Buffer.alloc(0);
                            if (!inLength.isZero()) {
                                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                            }
                            return [4 /*yield*/, runState.eei.callDelegate(gasLimit, toAddress, value, data)
                                // Write return data to memory
                            ];
                        case 1:
                            ret = _b.sent();
                            // Write return data to memory
                            util_1.writeCallOutput(runState, outOffset, outLength);
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0x06: STATICCALL
    [
        0xfa,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var value, _a, currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength, toAddress, gasLimit, data, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            value = new sbr_util_1.BN(0);
                            _a = __read(runState.stack.popN(6), 6), currentGasLimit = _a[0], toAddr = _a[1], inOffset = _a[2], inLength = _a[3], outOffset = _a[4], outLength = _a[5];
                            toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
                            util_1.subMemUsage(runState, inOffset, inLength);
                            util_1.subMemUsage(runState, outOffset, outLength);
                            EIP2929_1.accessAddressEIP2929(runState, toAddress);
                            gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState) // we set TangerineWhistle or later to true here, as STATICCALL was available from Byzantium (which is after TangerineWhistle)
                            ;
                            data = Buffer.alloc(0);
                            if (!inLength.isZero()) {
                                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                            }
                            return [4 /*yield*/, runState.eei.callStatic(gasLimit, toAddress, value, data)
                                // Write return data to memory
                            ];
                        case 1:
                            ret = _b.sent();
                            // Write return data to memory
                            util_1.writeCallOutput(runState, outOffset, outLength);
                            runState.stack.push(ret);
                            return [2 /*return*/];
                    }
                });
            });
        },
    ],
    // 0xf3: RETURN
    [
        0xf3,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), offset = _a[0], length = _a[1];
            util_1.subMemUsage(runState, offset, length);
            var returnData = Buffer.alloc(0);
            if (!length.isZero()) {
                returnData = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            runState.eei.finish(returnData);
        },
    ],
    // 0xfd: REVERT
    [
        0xfd,
        function (runState) {
            var _a = __read(runState.stack.popN(2), 2), offset = _a[0], length = _a[1];
            util_1.subMemUsage(runState, offset, length);
            var returnData = Buffer.alloc(0);
            if (!length.isZero()) {
                returnData = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            runState.eei.revert(returnData);
        },
    ],
    // '0x70', range - other
    // 0xff: SELFDESTRUCT
    [
        0xff,
        function (runState) {
            return __awaiter(this, void 0, void 0, function () {
                var selfdestructToAddressBN, selfdestructToAddress, deductGas, balance, empty, exists;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            selfdestructToAddressBN = runState.stack.pop();
                            if (runState.eei.isStatic()) {
                                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                            }
                            selfdestructToAddress = new sbr_util_1.Address(util_1.addressToBuffer(selfdestructToAddressBN));
                            deductGas = false;
                            if (!runState._common.gteHardfork('spuriousDragon')) return [3 /*break*/, 4];
                            return [4 /*yield*/, runState.eei.getExternalBalance(runState.eei.getAddress())];
                        case 1:
                            balance = _a.sent();
                            if (!balance.gtn(0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, runState.eei.isAccountEmpty(selfdestructToAddress)];
                        case 2:
                            empty = _a.sent();
                            if (empty) {
                                deductGas = true;
                            }
                            _a.label = 3;
                        case 3: return [3 /*break*/, 6];
                        case 4:
                            if (!runState._common.gteHardfork('tangerineWhistle')) return [3 /*break*/, 6];
                            return [4 /*yield*/, runState.stateManager.accountExists(selfdestructToAddress)];
                        case 5:
                            exists = _a.sent();
                            if (!exists) {
                                deductGas = true;
                            }
                            _a.label = 6;
                        case 6:
                            if (deductGas) {
                                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
                            }
                            EIP2929_1.accessAddressEIP2929(runState, selfdestructToAddress, true, true);
                            return [2 /*return*/, runState.eei.selfDestruct(selfdestructToAddress)];
                    }
                });
            });
        },
    ],
]);
// Fill in rest of PUSHn, DUPn, SWAPn, LOGn for handlers
var pushFn = exports.handlers.get(0x60);
for (var i = 0x61; i <= 0x7f; i++) {
    exports.handlers.set(i, pushFn);
}
var dupFn = exports.handlers.get(0x80);
for (var i = 0x81; i <= 0x8f; i++) {
    exports.handlers.set(i, dupFn);
}
var swapFn = exports.handlers.get(0x90);
for (var i = 0x91; i <= 0x9f; i++) {
    exports.handlers.set(i, swapFn);
}
var logFn = exports.handlers.get(0xa0);
for (var i = 0xa1; i <= 0xa4; i++) {
    exports.handlers.set(i, logFn);
}
//# sourceMappingURL=functions.js.map