"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustSstoreGasEIP2929 = exports.accessStorageEIP2929 = exports.accessAddressEIP2929 = void 0;
const sbr_util_1 = require("sbr-util");
/**
 * Adds address to accessedAddresses set if not already included.
 * Adjusts cost incurred for executing opcode based on whether address read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {BN}       address
 */
function accessAddressEIP2929(runState, address, chargeGas = true, isSelfdestruct = false) {
    if (!runState._common.isActivatedEIP(2929))
        return;
    const addressStr = address.buf;
    // Cold
    if (!runState.stateManager.isWarmedAddress(addressStr)) {
        // eslint-disable-next-line prettier/prettier
        runState.stateManager.addWarmedAddress(addressStr);
        // CREATE, CREATE2 opcodes have the address warmed for free.
        // selfdestruct beneficiary address reads are charged an *additional* cold access
        if (chargeGas) {
            runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'coldaccountaccess')));
        }
        // Warm: (selfdestruct beneficiary address reads are not charged when warm)
    }
    else if (chargeGas && !isSelfdestruct) {
        runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'warmstorageread')));
    }
}
exports.accessAddressEIP2929 = accessAddressEIP2929;
/**
 * Adds (address, key) to accessedStorage tuple set if not already included.
 * Adjusts cost incurred for executing opcode based on whether storage read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {Buffer} key (to storage slot)
 */
function accessStorageEIP2929(runState, key, isSstore) {
    if (!runState._common.isActivatedEIP(2929))
        return;
    const address = runState.eei.getAddress().buf;
    const slotIsCold = !runState.stateManager.isWarmedStorage(address, key);
    // Cold (SLOAD and SSTORE)
    if (slotIsCold) {
        // eslint-disable-next-line prettier/prettier
        runState.stateManager.addWarmedStorage(address, key);
        runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'coldsload')));
    }
    else if (!isSstore) {
        runState.eei.useGas(new sbr_util_1.BN(runState._common.param('gasPrices', 'warmstorageread')));
    }
}
exports.accessStorageEIP2929 = accessStorageEIP2929;
/**
 * Adjusts cost of SSTORE_RESET_GAS or SLOAD (aka sstorenoop) (EIP-2200) downward when storage
 * location is already warm
 * @param  {RunState} runState
 * @param  {Buffer}   key          storage slot
 * @param  {number}   defaultCost  SSTORE_RESET_GAS / SLOAD
 * @param  {string}   costName     parameter name ('reset' or 'noop')
 * @return {number}                adjusted cost
 */
function adjustSstoreGasEIP2929(runState, key, defaultCost, costName) {
    if (!runState._common.isActivatedEIP(2929))
        return defaultCost;
    const address = runState.eei.getAddress().buf;
    const warmRead = runState._common.param('gasPrices', 'warmstorageread');
    const coldSload = runState._common.param('gasPrices', 'coldsload');
    if (runState.stateManager.isWarmedStorage(address, key)) {
        switch (costName) {
            case 'reset':
                return defaultCost - coldSload;
            case 'noop':
                return warmRead;
            case 'initRefund':
                return runState._common.param('gasPrices', 'sstoreInitGasEIP2200') - warmRead;
            case 'cleanRefund':
                return runState._common.param('gasPrices', 'sstoreReset') - coldSload - warmRead;
        }
    }
    return defaultCost;
}
exports.adjustSstoreGasEIP2929 = adjustSstoreGasEIP2929;
//# sourceMappingURL=EIP2929.js.map