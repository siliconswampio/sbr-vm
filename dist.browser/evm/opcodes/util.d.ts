/// <reference types="node" />
/// <reference types="bn.js" />
import { Address, BN } from 'sbr-util';
import { RunState } from './../interpreter';
/**
 * Proxy function for sbr-util's setLengthLeft, except it returns a zero
 *
 * length buffer in case the buffer is full of zeros.
 * @param {Buffer} value Buffer which we want to pad
 */
export declare function setLengthLeftStorage(value: Buffer): Buffer;
/**
 * Wraps error message as VMError
 *
 * @param {string} err
 */
export declare function trap(err: string): void;
/**
 * Converts BN address (they're stored like this on the stack) to buffer address
 *
 * @param  {BN}     address
 * @return {Buffer}
 */
export declare function addressToBuffer(address: BN | Buffer): Buffer;
/**
 * Error message helper - generates location string
 *
 * @param  {RunState} runState
 * @return {string}
 */
export declare function describeLocation(runState: RunState): string;
/**
 * Find Ceil(a / b)
 *
 * @param {BN} a
 * @param {BN} b
 * @return {BN}
 */
export declare function divCeil(a: BN, b: BN): BN;
export declare function short(buffer: Buffer): string;
/**
 * Calls relevant stateManager.getContractStorage method based on hardfork
 *
 * @param {RunState} runState [description]
 * @param {Buffer}   address  [description]
 * @param {Buffer}   key      [description]
 * @return {Promise<Buffer>}
 */
export declare function getContractStorage(runState: RunState, address: Address, key: Buffer): Promise<any>;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 *
 * @param {BN} offset
 * @param {BN} length
 * @param {Buffer} data
 * @returns {Buffer}
 */
export declare function getDataSlice(data: Buffer, offset: BN, length: BN): Buffer;
/**
 * Get full opcode name from its name and code.
 *
 * @param code {number} Integer code of opcode.
 * @param name {string} Short name of the opcode.
 * @returns {string} Full opcode name
 */
export declare function getFullname(code: number, name: string): string;
/**
 * Checks if a jump is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
export declare function jumpIsValid(runState: RunState, dest: number): boolean;
/**
 * Checks if a jumpsub is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
export declare function jumpSubIsValid(runState: RunState, dest: number): boolean;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 *
 * the data with zeros to `length`.
 * @param {BN} gasLimit - requested gas Limit
 * @param {BN} gasLeft - current gas left
 * @param {RunState} runState - the current runState
 */
export declare function maxCallGas(gasLimit: BN, gasLeft: BN, runState: RunState): BN;
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 *
 * @method subMemUsage
 * @param {Object} runState
 * @param {BN} offset
 * @param {BN} length
 */
export declare function subMemUsage(runState: RunState, offset: BN, length: BN): void;
/**
 * Writes data returned by eei.call* methods to memory
 *
 * @param {RunState} runState
 * @param {BN}       outOffset
 * @param {BN}       outLength
 */
export declare function writeCallOutput(runState: RunState, outOffset: BN, outLength: BN): void;
/** The first rule set of SSTORE rules, which are the rules pre-Constantinople and in Petersburg
 * @param {RunState} runState
 * @param {any}      found
 * @param {Buffer}   value
 * @param {Buffer}   keyBuf
 */
export declare function updateSstoreGas(runState: RunState, found: any, value: Buffer, keyBuf: Buffer): void;
