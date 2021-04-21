"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sbr_util_1 = require("sbr-util");
const evm_1 = require("../evm");
const assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    const data = opts.data;
    const gasUsed = new sbr_util_1.BN(opts._common.param('gasPrices', 'sha256'));
    gasUsed.iadd(new sbr_util_1.BN(opts._common.param('gasPrices', 'sha256Word')).imuln(Math.ceil(data.length / 32)));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed,
        returnValue: sbr_util_1.sha256(data),
    };
}
exports.default = default_1;
//# sourceMappingURL=02-sha256.js.map