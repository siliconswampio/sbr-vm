"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sbr_util_1 = require("sbr-util");
const evm_1 = require("../evm");
const assert = require('assert');
const bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    const inputData = opts.data;
    const gasUsed = new sbr_util_1.BN(opts._common.param('gasPrices', 'ecMul'));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    const returnData = bn128.mul(inputData);
    // check ecmul success or failure by comparing the output length
    if (returnData.length !== 64) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=07-ecmul.js.map