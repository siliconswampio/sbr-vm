import Blockchain from '@sbr/blockchain';
import VM from './index';
/**
 * @ignore
 */
export default function runBlockchain(this: VM, blockchain?: Blockchain, maxBlocks?: number): Promise<void | number>;
