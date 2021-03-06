"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sbr_util_1 = require("sbr-util");
var evm_1 = require("../evm");
var assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    var data = opts.data;
    var gasUsed = new sbr_util_1.BN(opts._common.param('gasPrices', 'ripemd160'));
    gasUsed.iadd(new sbr_util_1.BN(opts._common.param('gasPrices', 'ripemd160Word')).imuln(Math.ceil(data.length / 32)));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        returnValue: sbr_util_1.ripemd160(data, true),
    };
}
exports.default = default_1;
//# sourceMappingURL=03-ripemd160.js.map