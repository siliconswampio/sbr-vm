"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const sbr_util_1 = require("sbr-util");
const util_1 = require("./util");
const EIP1283_1 = require("./EIP1283");
const EIP2200_1 = require("./EIP2200");
const EIP2929_1 = require("./EIP2929");
const exceptions_1 = require("../../exceptions");
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
            const [a, b] = runState.stack.popN(2);
            const r = a.add(b).mod(sbr_util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x02: MUL
    [
        0x02,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a.mul(b).mod(sbr_util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x03: SUB
    [
        0x03,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a.sub(b).toTwos(256);
            runState.stack.push(r);
        },
    ],
    // 0x04: DIV
    [
        0x04,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
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
            let [a, b] = runState.stack.popN(2);
            let r;
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
            const [a, b] = runState.stack.popN(2);
            let r;
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
            let [a, b] = runState.stack.popN(2);
            let r;
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
            const [a, b, c] = runState.stack.popN(3);
            let r;
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
            const [a, b, c] = runState.stack.popN(3);
            let r;
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
            const [base, exponent] = runState.stack.popN(2);
            if (exponent.isZero()) {
                runState.stack.push(new sbr_util_1.BN(1));
                return;
            }
            const byteLength = exponent.byteLength();
            if (byteLength < 1 || byteLength > 32) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_RANGE);
            }
            const gasPrice = runState._common.param('gasPrices', 'expByte');
            const amount = new sbr_util_1.BN(byteLength).muln(gasPrice);
            runState.eei.useGas(amount);
            if (base.isZero()) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const m = sbr_util_1.BN.red(sbr_util_1.TWO_POW256);
            const redBase = base.toRed(m);
            const r = redBase.redPow(exponent);
            runState.stack.push(r.fromRed());
        },
    ],
    // 0x0b: SIGNEXTEND
    [
        0x0b,
        function (runState) {
            /* eslint-disable-next-line prefer-const */
            let [k, val] = runState.stack.popN(2);
            if (k.ltn(31)) {
                const signBit = k.muln(8).iaddn(7).toNumber();
                const mask = new sbr_util_1.BN(1).ishln(signBit).isubn(1);
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
            const [a, b] = runState.stack.popN(2);
            const r = new sbr_util_1.BN(a.lt(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x11: GT
    [
        0x11,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = new sbr_util_1.BN(a.gt(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x12: SLT
    [
        0x12,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = new sbr_util_1.BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x13: SGT
    [
        0x13,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = new sbr_util_1.BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x14: EQ
    [
        0x14,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = new sbr_util_1.BN(a.eq(b) ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x15: ISZERO
    [
        0x15,
        function (runState) {
            const a = runState.stack.pop();
            const r = new sbr_util_1.BN(a.isZero() ? 1 : 0);
            runState.stack.push(r);
        },
    ],
    // 0x16: AND
    [
        0x16,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a.and(b);
            runState.stack.push(r);
        },
    ],
    // 0x17: OR
    [
        0x17,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a.or(b);
            runState.stack.push(r);
        },
    ],
    // 0x18: XOR
    [
        0x18,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a.xor(b);
            runState.stack.push(r);
        },
    ],
    // 0x19: NOT
    [
        0x19,
        function (runState) {
            const a = runState.stack.pop();
            const r = a.notn(256);
            runState.stack.push(r);
        },
    ],
    // 0x1a: BYTE
    [
        0x1a,
        function (runState) {
            const [pos, word] = runState.stack.popN(2);
            if (pos.gten(32)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const r = new sbr_util_1.BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff));
            runState.stack.push(r);
        },
    ],
    // 0x1b: SHL
    [
        0x1b,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            if (a.gten(256)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const r = b.shln(a.toNumber()).iand(sbr_util_1.MAX_INTEGER);
            runState.stack.push(r);
        },
    ],
    // 0x1c: SHR
    [
        0x1c,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            if (a.gten(256)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const r = b.shrn(a.toNumber());
            runState.stack.push(r);
        },
    ],
    // 0x1d: SAR
    [
        0x1d,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            const isSigned = b.testn(255);
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
            const c = b.shrn(a.toNumber());
            if (isSigned) {
                const shiftedOutWidth = 255 - a.toNumber();
                const mask = sbr_util_1.MAX_INTEGER.shrn(shiftedOutWidth).shln(shiftedOutWidth);
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
            const [offset, length] = runState.stack.popN(2);
            util_1.subMemUsage(runState, offset, length);
            let data = Buffer.alloc(0);
            if (!length.isZero()) {
                data = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            // copy fee
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sha3Word')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            const r = new sbr_util_1.BN(sbr_util_1.keccak256(data));
            runState.stack.push(r);
        },
    ],
    // 0x30 range - closure state
    // 0x30: ADDRESS
    [
        0x30,
        function (runState) {
            const address = new sbr_util_1.BN(runState.eei.getAddress().buf);
            runState.stack.push(address);
        },
    ],
    // 0x31: BALANCE
    [
        0x31,
        async function (runState) {
            const addressBN = runState.stack.pop();
            const address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
            EIP2929_1.accessAddressEIP2929(runState, address);
            const balance = await runState.eei.getExternalBalance(address);
            runState.stack.push(balance);
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
            const pos = runState.stack.pop();
            if (pos.gt(runState.eei.getCallDataSize())) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const i = pos.toNumber();
            let loaded = runState.eei.getCallData().slice(i, i + 32);
            loaded = loaded.length ? loaded : Buffer.from([0]);
            const r = new sbr_util_1.BN(sbr_util_1.setLengthRight(loaded, 32));
            runState.stack.push(r);
        },
    ],
    // 0x36: CALLDATASIZE
    [
        0x36,
        function (runState) {
            const r = runState.eei.getCallDataSize();
            runState.stack.push(r);
        },
    ],
    // 0x37: CALLDATACOPY
    [
        0x37,
        function (runState) {
            const [memOffset, dataOffset, dataLength] = runState.stack.popN(3);
            util_1.subMemUsage(runState, memOffset, dataLength);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(dataLength, new sbr_util_1.BN(32))));
            const data = util_1.getDataSlice(runState.eei.getCallData(), dataOffset, dataLength);
            const memOffsetNum = memOffset.toNumber();
            const dataLengthNum = dataLength.toNumber();
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
            const [memOffset, codeOffset, length] = runState.stack.popN(3);
            util_1.subMemUsage(runState, memOffset, length);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            const data = util_1.getDataSlice(runState.eei.getCode(), codeOffset, length);
            const memOffsetNum = memOffset.toNumber();
            const lengthNum = length.toNumber();
            runState.memory.extend(memOffsetNum, lengthNum);
            runState.memory.write(memOffsetNum, lengthNum, data);
        },
    ],
    // 0x3b: EXTCODESIZE
    [
        0x3b,
        async function (runState) {
            const addressBN = runState.stack.pop();
            const address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
            EIP2929_1.accessAddressEIP2929(runState, address);
            const size = await runState.eei.getExternalCodeSize(addressBN);
            runState.stack.push(size);
        },
    ],
    // 0x3c: EXTCODECOPY
    [
        0x3c,
        async function (runState) {
            const [addressBN, memOffset, codeOffset, length] = runState.stack.popN(4);
            // FIXME: for some reason this must come before subGas
            util_1.subMemUsage(runState, memOffset, length);
            const address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
            EIP2929_1.accessAddressEIP2929(runState, address);
            // copy fee
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            const code = await runState.eei.getExternalCode(addressBN);
            const data = util_1.getDataSlice(code, codeOffset, length);
            const memOffsetNum = memOffset.toNumber();
            const lengthNum = length.toNumber();
            runState.memory.extend(memOffsetNum, lengthNum);
            runState.memory.write(memOffsetNum, lengthNum, data);
        },
    ],
    // 0x3f: EXTCODEHASH
    [
        0x3f,
        async function (runState) {
            const addressBN = runState.stack.pop();
            const address = new sbr_util_1.Address(util_1.addressToBuffer(addressBN));
            EIP2929_1.accessAddressEIP2929(runState, address);
            const empty = await runState.eei.isAccountEmpty(address);
            if (empty) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const code = await runState.eei.getExternalCode(addressBN);
            if (code.length === 0) {
                runState.stack.push(new sbr_util_1.BN(sbr_util_1.KECCAK256_NULL));
                return;
            }
            runState.stack.push(new sbr_util_1.BN(sbr_util_1.keccak256(code)));
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
            const [memOffset, returnDataOffset, length] = runState.stack.popN(3);
            if (returnDataOffset.add(length).gt(runState.eei.getReturnDataSize())) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
            }
            util_1.subMemUsage(runState, memOffset, length);
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'copy')).mul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            const data = util_1.getDataSlice(runState.eei.getReturnData(), returnDataOffset, length);
            const memOffsetNum = memOffset.toNumber();
            const lengthNum = length.toNumber();
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
        async function (runState) {
            const number = runState.stack.pop();
            const diff = runState.eei.getBlockNumber().sub(number);
            // block lookups must be within the past 256 blocks
            if (diff.gtn(256) || diff.lten(0)) {
                runState.stack.push(new sbr_util_1.BN(0));
                return;
            }
            const hash = await runState.eei.getBlockHash(number);
            runState.stack.push(hash);
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
            const pos = runState.stack.pop();
            util_1.subMemUsage(runState, pos, new sbr_util_1.BN(32));
            const word = runState.memory.read(pos.toNumber(), 32);
            runState.stack.push(new sbr_util_1.BN(word));
        },
    ],
    // 0x52: MSTORE
    [
        0x52,
        function (runState) {
            const [offset, word] = runState.stack.popN(2);
            const buf = word.toArrayLike(Buffer, 'be', 32);
            util_1.subMemUsage(runState, offset, new sbr_util_1.BN(32));
            const offsetNum = offset.toNumber();
            runState.memory.extend(offsetNum, 32);
            runState.memory.write(offsetNum, 32, buf);
        },
    ],
    // 0x53: MSTORE8
    [
        0x53,
        function (runState) {
            const [offset, byte] = runState.stack.popN(2);
            // NOTE: we're using a 'trick' here to get the least significant byte
            // NOTE: force cast necessary because `BN.andln` returns number but
            // the types are wrong
            const buf = Buffer.from([byte.andln(0xff)]);
            util_1.subMemUsage(runState, offset, new sbr_util_1.BN(1));
            const offsetNum = offset.toNumber();
            runState.memory.extend(offsetNum, 1);
            runState.memory.write(offsetNum, 1, buf);
        },
    ],
    // 0x54: SLOAD
    [
        0x54,
        async function (runState) {
            const key = runState.stack.pop();
            const keyBuf = key.toArrayLike(Buffer, 'be', 32);
            EIP2929_1.accessStorageEIP2929(runState, keyBuf, false);
            const value = await runState.eei.storageLoad(keyBuf);
            const valueBN = value.length ? new sbr_util_1.BN(value) : new sbr_util_1.BN(0);
            runState.stack.push(valueBN);
        },
    ],
    // 0x55: SSTORE
    [
        0x55,
        async function (runState) {
            if (runState.eei.isStatic()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const [key, val] = runState.stack.popN(2);
            const keyBuf = key.toArrayLike(Buffer, 'be', 32);
            // NOTE: this should be the shortest representation
            let value;
            if (val.isZero()) {
                value = Buffer.from([]);
            }
            else {
                value = val.toArrayLike(Buffer, 'be');
            }
            // TODO: Replace getContractStorage with EEI method
            const found = await util_1.getContractStorage(runState, runState.eei.getAddress(), keyBuf);
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
            await runState.eei.storageStore(keyBuf, value);
        },
    ],
    // 0x56: JUMP
    [
        0x56,
        function (runState) {
            const dest = runState.stack.pop();
            if (dest.gt(runState.eei.getCodeSize())) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
            }
            const destNum = dest.toNumber();
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
            const [dest, cond] = runState.stack.popN(2);
            if (!cond.isZero()) {
                if (dest.gt(runState.eei.getCodeSize())) {
                    util_1.trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + util_1.describeLocation(runState));
                }
                const destNum = dest.toNumber();
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
            const dest = runState.returnStack.pop();
            runState.programCounter = dest.toNumber();
        },
    ],
    // 0x5e: JUMPSUB
    [
        0x5e,
        function (runState) {
            const dest = runState.stack.pop();
            if (dest.gt(runState.eei.getCodeSize())) {
                util_1.trap(exceptions_1.ERROR.INVALID_JUMPSUB + ' at ' + util_1.describeLocation(runState));
            }
            const destNum = dest.toNumber();
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
            const numToPush = runState.opCode - 0x5f;
            const loaded = new sbr_util_1.BN(runState.eei.getCode().slice(runState.programCounter, runState.programCounter + numToPush));
            runState.programCounter += numToPush;
            runState.stack.push(loaded);
        },
    ],
    // 0x80: DUP
    [
        0x80,
        function (runState) {
            const stackPos = runState.opCode - 0x7f;
            runState.stack.dup(stackPos);
        },
    ],
    // 0x90: SWAP
    [
        0x90,
        function (runState) {
            const stackPos = runState.opCode - 0x8f;
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
            const [memOffset, memLength] = runState.stack.popN(2);
            const topicsCount = runState.opCode - 0xa0;
            if (topicsCount < 0 || topicsCount > 4) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_RANGE);
            }
            const topics = runState.stack.popN(topicsCount);
            const topicsBuf = topics.map(function (a) {
                return a.toArrayLike(Buffer, 'be', 32);
            });
            util_1.subMemUsage(runState, memOffset, memLength);
            let mem = Buffer.alloc(0);
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
        async function (runState) {
            if (runState.eei.isStatic()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const [value, offset, length] = runState.stack.popN(3);
            EIP2929_1.accessAddressEIP2929(runState, runState.eei.getAddress(), false);
            util_1.subMemUsage(runState, offset, length);
            let gasLimit = new sbr_util_1.BN(runState.eei.getGasLeft());
            gasLimit = util_1.maxCallGas(gasLimit, runState.eei.getGasLeft(), runState);
            let data = Buffer.alloc(0);
            if (!length.isZero()) {
                data = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            const ret = await runState.eei.create(gasLimit, value, data);
            runState.stack.push(ret);
        },
    ],
    // 0xf5: CREATE2
    [
        0xf5,
        async function (runState) {
            if (runState.eei.isStatic()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const [value, offset, length, salt] = runState.stack.popN(4);
            util_1.subMemUsage(runState, offset, length);
            EIP2929_1.accessAddressEIP2929(runState, runState.eei.getAddress(), false);
            // Deduct gas costs for hashing
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'sha3Word')).imul(util_1.divCeil(length, new sbr_util_1.BN(32))));
            let gasLimit = new sbr_util_1.BN(runState.eei.getGasLeft());
            gasLimit = util_1.maxCallGas(gasLimit, runState.eei.getGasLeft(), runState); // CREATE2 is only available after TangerineWhistle (Constantinople introduced this opcode)
            let data = Buffer.alloc(0);
            if (!length.isZero()) {
                data = runState.memory.read(offset.toNumber(), length.toNumber());
            }
            const ret = await runState.eei.create2(gasLimit, value, data, salt.toArrayLike(Buffer, 'be', 32));
            runState.stack.push(ret);
        },
    ],
    // 0xf1: CALL
    [
        0xf1,
        async function (runState) {
            const [currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength,] = runState.stack.popN(7);
            const toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
            if (runState.eei.isStatic() && !value.isZero()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            util_1.subMemUsage(runState, inOffset, inLength);
            util_1.subMemUsage(runState, outOffset, outLength);
            EIP2929_1.accessAddressEIP2929(runState, toAddress);
            if (!value.isZero()) {
                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callValueTransfer')));
            }
            let data = Buffer.alloc(0);
            if (!inLength.isZero()) {
                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
            }
            if (runState._common.gteHardfork('spuriousDragon')) {
                // We are at or after Spurious Dragon
                // Call new account gas: account is DEAD and we transfer nonzero value
                if ((await runState.eei.isAccountEmpty(toAddress)) && !value.isZero()) {
                    runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
                }
            }
            else if (!(await runState.eei.accountExists(toAddress))) {
                // We are before Spurious Dragon and the account does not exist.
                // Call new account gas: account does not exist (it is not in the state trie, not even as an "empty" account)
                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
            }
            const gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
            if (gasLimit.gt(runState.eei.getGasLeft())) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
            }
            if (!value.isZero()) {
                // TODO: Don't use private attr directly
                runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
            }
            const ret = await runState.eei.call(gasLimit, toAddress, value, data);
            // Write return data to memory
            util_1.writeCallOutput(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf2: CALLCODE
    [
        0xf2,
        async function (runState) {
            const [currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength,] = runState.stack.popN(7);
            const toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
            util_1.subMemUsage(runState, inOffset, inLength);
            util_1.subMemUsage(runState, outOffset, outLength);
            EIP2929_1.accessAddressEIP2929(runState, toAddress);
            if (!value.isZero()) {
                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callValueTransfer')));
            }
            const gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
            if (gasLimit.gt(runState.eei.getGasLeft())) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
            }
            if (!value.isZero()) {
                // TODO: Don't use private attr directly
                runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
            }
            let data = Buffer.alloc(0);
            if (!inLength.isZero()) {
                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
            }
            const ret = await runState.eei.callCode(gasLimit, toAddress, value, data);
            // Write return data to memory
            util_1.writeCallOutput(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf4: DELEGATECALL
    [
        0xf4,
        async function (runState) {
            const value = runState.eei.getCallValue();
            const [currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength,] = runState.stack.popN(6);
            const toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
            util_1.subMemUsage(runState, inOffset, inLength);
            util_1.subMemUsage(runState, outOffset, outLength);
            EIP2929_1.accessAddressEIP2929(runState, toAddress);
            const gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState);
            // note that TangerineWhistle or later this cannot happen (it could have ran out of gas prior to getting here though)
            if (gasLimit.gt(runState.eei.getGasLeft())) {
                util_1.trap(exceptions_1.ERROR.OUT_OF_GAS);
            }
            let data = Buffer.alloc(0);
            if (!inLength.isZero()) {
                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
            }
            const ret = await runState.eei.callDelegate(gasLimit, toAddress, value, data);
            // Write return data to memory
            util_1.writeCallOutput(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0x06: STATICCALL
    [
        0xfa,
        async function (runState) {
            const value = new sbr_util_1.BN(0);
            const [currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength,] = runState.stack.popN(6);
            const toAddress = new sbr_util_1.Address(util_1.addressToBuffer(toAddr));
            util_1.subMemUsage(runState, inOffset, inLength);
            util_1.subMemUsage(runState, outOffset, outLength);
            EIP2929_1.accessAddressEIP2929(runState, toAddress);
            const gasLimit = util_1.maxCallGas(currentGasLimit, runState.eei.getGasLeft(), runState); // we set TangerineWhistle or later to true here, as STATICCALL was available from Byzantium (which is after TangerineWhistle)
            let data = Buffer.alloc(0);
            if (!inLength.isZero()) {
                data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
            }
            const ret = await runState.eei.callStatic(gasLimit, toAddress, value, data);
            // Write return data to memory
            util_1.writeCallOutput(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf3: RETURN
    [
        0xf3,
        function (runState) {
            const [offset, length] = runState.stack.popN(2);
            util_1.subMemUsage(runState, offset, length);
            let returnData = Buffer.alloc(0);
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
            const [offset, length] = runState.stack.popN(2);
            util_1.subMemUsage(runState, offset, length);
            let returnData = Buffer.alloc(0);
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
        async function (runState) {
            const selfdestructToAddressBN = runState.stack.pop();
            if (runState.eei.isStatic()) {
                util_1.trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const selfdestructToAddress = new sbr_util_1.Address(util_1.addressToBuffer(selfdestructToAddressBN));
            let deductGas = false;
            if (runState._common.gteHardfork('spuriousDragon')) {
                // EIP-161: State Trie Clearing
                const balance = await runState.eei.getExternalBalance(runState.eei.getAddress());
                if (balance.gtn(0)) {
                    // This technically checks if account is empty or non-existent
                    // TODO: improve on the API here (EEI and StateManager)
                    const empty = await runState.eei.isAccountEmpty(selfdestructToAddress);
                    if (empty) {
                        deductGas = true;
                    }
                }
            }
            else if (runState._common.gteHardfork('tangerineWhistle')) {
                // Pre EIP-150 (Tangerine Whistle) gas semantics
                const exists = await runState.stateManager.accountExists(selfdestructToAddress);
                if (!exists) {
                    deductGas = true;
                }
            }
            if (deductGas) {
                runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'callNewAccount')));
            }
            EIP2929_1.accessAddressEIP2929(runState, selfdestructToAddress, true, true);
            return runState.eei.selfDestruct(selfdestructToAddress);
        },
    ],
]);
// Fill in rest of PUSHn, DUPn, SWAPn, LOGn for handlers
const pushFn = exports.handlers.get(0x60);
for (let i = 0x61; i <= 0x7f; i++) {
    exports.handlers.set(i, pushFn);
}
const dupFn = exports.handlers.get(0x80);
for (let i = 0x81; i <= 0x8f; i++) {
    exports.handlers.set(i, dupFn);
}
const swapFn = exports.handlers.get(0x90);
for (let i = 0x91; i <= 0x9f; i++) {
    exports.handlers.set(i, swapFn);
}
const logFn = exports.handlers.get(0xa0);
for (let i = 0xa1; i <= 0xa4; i++) {
    exports.handlers.set(i, logFn);
}
//# sourceMappingURL=functions.js.map