"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sbr_util_1 = require("sbr-util");
var evm_1 = require("../evm");
var assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    var gasUsed = new sbr_util_1.BN(opts._common.param('gasPrices', 'ecRecover'));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    var data = sbr_util_1.setLengthRight(opts.data, 128);
    var msgHash = data.slice(0, 32);
    var v = data.slice(32, 64);
    var r = data.slice(64, 96);
    var s = data.slice(96, 128);
    var publicKey;
    try {
        publicKey = sbr_util_1.ecrecover(msgHash, new sbr_util_1.BN(v), r, s);
    }
    catch (e) {
        return {
            gasUsed: gasUsed,
            returnValue: Buffer.alloc(0),
        };
    }
    return {
        gasUsed: gasUsed,
        returnValue: sbr_util_1.setLengthLeft(sbr_util_1.publicToAddress(publicKey), 32),
    };
}
exports.default = default_1;
//# sourceMappingURL=01-ecrecover.js.map