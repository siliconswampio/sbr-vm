/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from 'sbr-util';
import { TypedTransaction } from '@sbr/tx';
import { Block, BlockOptions, HeaderData } from '@sbr/block';
import VM from '.';
import { RunTxResult } from './runTx';
/**
 * Options for building a block.
 */
export interface BuildBlockOpts {
    /**
     * The parent block
     */
    parentBlock: Block;
    /**
     * The block header data to use.
     * Defaults used for any values not provided.
     */
    headerData?: HeaderData;
    /**
     * The block options to use.
     */
    blockOpts?: BlockOptions;
}
/**
 * Options for sealing a block.
 */
export interface SealBlockOpts {
    /**
     * For PoW, the nonce.
     * Overrides the value passed in the constructor.
     */
    nonce?: Buffer;
    /**
     * For PoW, the mixHash.
     * Overrides the value passed in the constructor.
     */
    mixHash?: Buffer;
}
export declare class BlockBuilder {
    /**
     * The cumulative gas used by the transactions added to the block.
     */
    gasUsed: BN;
    private readonly vm;
    private blockOpts;
    private headerData;
    private transactions;
    private transactionResults;
    private checkpointed;
    private reverted;
    private built;
    constructor(vm: VM, opts: BuildBlockOpts);
    /**
     * Throws if the block has already been built or reverted.
     */
    private checkStatus;
    /**
     * Calculates and returns the transactionsTrie for the block.
     */
    private transactionsTrie;
    /**
     * Calculates and returns the logs bloom for the block.
     */
    private bloom;
    /**
     * Calculates and returns the receiptTrie for the block.
     */
    private receiptTrie;
    /**
     * Adds the block miner reward to the coinbase account.
     */
    private rewardMiner;
    /**
     * Run and add a transaction to the block being built.
     * Please note that this modifies the state of the VM.
     * Throws if the transaction's gasLimit is greater than
     * the remaining gas in the block.
     */
    addTransaction(tx: TypedTransaction): Promise<RunTxResult>;
    /**
     * Reverts the checkpoint on the StateManager to reset the state from any transactions that have been run.
     */
    revert(): Promise<void>;
    /**
     * This method returns the finalized block.
     * It also:
     *  - Assigns the reward for miner (PoW)
     *  - Commits the checkpoint on the StateManager
     *  - Sets the tip of the VM's blockchain to this block
     * For PoW, optionally seals the block with params `nonce` and `mixHash`,
     * which is validated along with the block number and difficulty by ethash.
     * For PoA, please pass `blockOption.cliqueSigner` into the buildBlock constructor,
     * as the signer will be awarded the txs amount spent on gas as they are added.
     */
    build(sealOpts?: SealBlockOpts): Promise<Block>;
}
export default function buildBlock(this: VM, opts: BuildBlockOpts): Promise<BlockBuilder>;
