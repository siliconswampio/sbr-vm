"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sbr_util_1 = require("sbr-util");
var block_1 = require("@sbr/block");
var txContext_1 = __importDefault(require("./evm/txContext"));
var message_1 = __importDefault(require("./evm/message"));
var evm_1 = __importDefault(require("./evm/evm"));
/**
 * @ignore
 */
function runCall(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var block = (_a = opts.block) !== null && _a !== void 0 ? _a : block_1.Block.fromBlockData({}, { common: this._common });
    var txContext = new txContext_1.default((_b = opts.gasPrice) !== null && _b !== void 0 ? _b : new sbr_util_1.BN(0), (_d = (_c = opts.origin) !== null && _c !== void 0 ? _c : opts.caller) !== null && _d !== void 0 ? _d : sbr_util_1.Address.zero());
    var message = new message_1.default({
        caller: opts.caller,
        gasLimit: (_e = opts.gasLimit) !== null && _e !== void 0 ? _e : new sbr_util_1.BN(0xffffff),
        to: (_f = opts.to) !== null && _f !== void 0 ? _f : undefined,
        value: opts.value,
        data: opts.data,
        code: opts.code,
        depth: (_g = opts.depth) !== null && _g !== void 0 ? _g : 0,
        isCompiled: (_h = opts.compiled) !== null && _h !== void 0 ? _h : false,
        isStatic: (_j = opts.static) !== null && _j !== void 0 ? _j : false,
        salt: (_k = opts.salt) !== null && _k !== void 0 ? _k : null,
        selfdestruct: (_l = opts.selfdestruct) !== null && _l !== void 0 ? _l : {},
        delegatecall: (_m = opts.delegatecall) !== null && _m !== void 0 ? _m : false,
    });
    var evm = new evm_1.default(this, txContext, block);
    return evm.executeMessage(message);
}
exports.default = runCall;
//# sourceMappingURL=runCall.js.map