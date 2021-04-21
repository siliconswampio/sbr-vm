/// <reference types="bn.js" />
import { Address, BN } from 'sbr-util';
export default class TxContext {
    gasPrice: BN;
    origin: Address;
    constructor(gasPrice: BN, origin: Address);
}
