import tape from 'tape'
import { Account, Address, BN, MAX_INTEGER } from 'sbr-util'
import { Block } from '@sbr/block'
import Common from '@sbr/common'
import { Transaction, TransactionFactory } from '@sbr/tx'
import VM from '../../lib'
import { createAccount, getTransaction } from './utils'

const TRANSACTION_TYPES = [
  {
    type: 0,
    name: 'legacy tx',
  },
  {
    type: 1,
    name: 'EIP2930 tx',
  },
]
const common = new Common({ chain: 'mainnet', hardfork: 'berlin' })
common.setMaxListeners(100)

tape('runTx() -> successful API parameter usage', async (t) => {
  async function simpleRun(vm: VM, msg: string) {
    for (const txType of TRANSACTION_TYPES) {
      const tx = getTransaction(vm._common, txType.type, true)

      const caller = tx.getSenderAddress()
      const acc = createAccount()
      await vm.stateManager.putAccount(caller, acc)

      const res = await vm.runTx({ tx })
      t.true(res.gasUsed.gt(new BN(0)), `${msg} (${txType.name})`)
    }
  }

  t.test('simple run (unmodified options)', async (t) => {
    let common = new Common({ chain: 'mainnet', hardfork: 'berlin' })
    let vm = new VM({ common })
    await simpleRun(vm, 'mainnet (PoW), berlin HF, default SM - should run without errors')

    common = new Common({ chain: 'rinkeby', hardfork: 'berlin' })
    vm = new VM({ common })
    await simpleRun(vm, 'rinkeby (PoA), berlin HF, default SM - should run without errors')

    t.end()
  })

  t.test('Legacy Transaction with HF set to pre-Berlin', async (t) => {
    const common = new Common({ chain: 'mainnet', hardfork: 'istanbul' })
    const vm = new VM({ common })

    const tx = getTransaction(vm._common, 0, true)

    const caller = tx.getSenderAddress()
    const acc = createAccount()
    await vm.stateManager.putAccount(caller, acc)

    const res = await vm.runTx({ tx })
    t.true(
      res.gasUsed.gt(new BN(0)),
      `mainnet (PoW), istanbul HF, default SM - should run without errors (${TRANSACTION_TYPES[0].name})`
    )

    t.end()
  })

  t.test(
    'custom block (block option), disabled block gas limit validation (skipBlockGasLimitValidation: true)',
    async (t) => {
      for (const txType of TRANSACTION_TYPES) {
        const vm = new VM({ common })

        const privateKey = Buffer.from(
          'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
          'hex'
        )
        const address = Address.fromPrivateKey(privateKey)
        const initialBalance = new BN(10).pow(new BN(18))

        const account = await vm.stateManager.getAccount(address)
        await vm.stateManager.putAccount(
          address,
          Account.fromAccountData({ ...account, balance: initialBalance })
        )

        const transferCost = 21000
        const unsignedTx = Transaction.fromTxData({
          to: address,
          gasLimit: transferCost,
          gasPrice: 1,
          nonce: 0,
        })
        const tx = unsignedTx.sign(privateKey)

        const coinbase = Buffer.from('00000000000000000000000000000000000000ff', 'hex')
        const block = Block.fromBlockData({
          header: {
            gasLimit: transferCost - 1,
            coinbase,
          },
        })

        const result = await vm.runTx({
          tx,
          block,
          skipBlockGasLimitValidation: true,
        })

        const coinbaseAccount = await vm.stateManager.getAccount(new Address(coinbase))
        t.equals(
          coinbaseAccount.balance.toNumber(),
          21000,
          `should use custom block (${txType.name})`
        )

        t.equals(
          result.execResult.exceptionError,
          undefined,
          `should run ${txType.name} without errors`
        )
      }
      t.end()
    }
  )
})

tape('runTx() -> API parameter usage/data errors', (t) => {
  t.test('Typed Transaction with HF set to pre-Berlin', async (t) => {
    const common = new Common({ chain: 'mainnet', hardfork: 'istanbul' })
    const vm = new VM({ common })

    const tx = getTransaction(new Common({ chain: 'mainnet', hardfork: 'berlin' }), 1, true)

    const caller = tx.getSenderAddress()
    const acc = createAccount()
    await vm.stateManager.putAccount(caller, acc)

    try {
      await vm.runTx({ tx })
    } catch (e) {
      console.log(e)
      t.ok(
        e.message.includes('(EIP-2718) not activated'),
        `should fail for ${TRANSACTION_TYPES[1].name}`
      )
    }

    t.end()
  })

  t.test('simple run (reportAccessList option)', async (t) => {
    const vm = new VM({ common })

    const tx = getTransaction(vm._common, 0, true)

    const caller = tx.getSenderAddress()
    const acc = createAccount()
    await vm.stateManager.putAccount(caller, acc)

    const res = await vm.runTx({ tx, reportAccessList: true })
    t.true(
      res.gasUsed.gt(new BN(0)),
      `mainnet (PoW), istanbul HF, default SM - should run without errors (${TRANSACTION_TYPES[0].name})`
    )
    t.deepEqual(res.accessList, [])
    t.end()
  })

  t.test('run without signature', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const vm = new VM({ common })
      const tx = getTransaction(vm._common, txType.type, false)
      try {
        await vm.runTx({ tx })
      } catch (e) {
        t.ok(e.message.includes('not signed'), `should fail for ${txType.name}`)
      }
    }
    t.end()
  })

  t.test('run with insufficient funds', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const vm = new VM({ common })
      const tx = getTransaction(vm._common, txType.type, true)
      try {
        await vm.runTx({ tx })
      } catch (e) {
        t.ok(e.message.toLowerCase().includes('enough funds'), `should fail for ${txType.name}`)
      }
    }
    t.end()
  })
})

tape('runTx() -> runtime behavior', async (t) => {
  t.test('storage cache', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const common = new Common({ chain: 'mainnet', hardfork: 'berlin' })
      const vm = new VM({ common })
      const privateKey = Buffer.from(
        'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
        'hex'
      )
      /* Code which is deployed here: 
        PUSH1 01
        PUSH1 00
        SSTORE
        INVALID
      */
      const code = Buffer.from('6001600055FE', 'hex')
      const address = new Address(Buffer.from('00000000000000000000000000000000000000ff', 'hex'))
      await vm.stateManager.putContractCode(address, code)
      await vm.stateManager.putContractStorage(
        address,
        Buffer.from('00'.repeat(32), 'hex'),
        Buffer.from('00'.repeat(31) + '01', 'hex')
      )
      const txParams: any = {
        nonce: '0x00',
        gasPrice: 1,
        gasLimit: 100000,
        to: address,
      }
      if (txType.type === 1) {
        txParams['chainId'] = common.chainIdBN()
        txParams['accessList'] = []
        txParams['type'] = txType.type
      }
      const tx = TransactionFactory.fromTxData(txParams, { common }).sign(privateKey)

      await vm.stateManager.putAccount(tx.getSenderAddress(), createAccount())

      await vm.runTx({ tx }) // this tx will fail, but we have to ensure that the cache is cleared

      t.equal(
        (<any>vm.stateManager)._originalStorageCache.size,
        0,
        `should clear storage cache after every ${txType.name}`
      )
    }
    t.end()
  })
})

tape('runTx() -> runtime errors', async (t) => {
  t.test('account balance overflows (call)', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const vm = new VM({ common })
      const tx = getTransaction(vm._common, txType.type, true, '0x01')

      const caller = tx.getSenderAddress()
      const from = createAccount()
      await vm.stateManager.putAccount(caller, from)

      const to = createAccount(new BN(0), MAX_INTEGER)
      await vm.stateManager.putAccount(tx.to!, to)

      const res = await vm.runTx({ tx })

      t.equal(
        res.execResult!.exceptionError!.error,
        'value overflow',
        `result should have 'value overflow' error set (${txType.name})`
      )
      t.equal(
        (<any>vm.stateManager)._checkpointCount,
        0,
        `checkpoint count should be 0 (${txType.name})`
      )
    }
    t.end()
  })

  t.test('account balance overflows (create)', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const vm = new VM({ common })
      const tx = getTransaction(vm._common, txType.type, true, '0x01', true)

      const caller = tx.getSenderAddress()
      const from = createAccount()
      await vm.stateManager.putAccount(caller, from)

      const contractAddress = new Address(
        Buffer.from('61de9dc6f6cff1df2809480882cfd3c2364b28f7', 'hex')
      )
      const to = createAccount(new BN(0), MAX_INTEGER)
      await vm.stateManager.putAccount(contractAddress, to)

      const res = await vm.runTx({ tx })

      t.equal(
        res.execResult!.exceptionError!.error,
        'value overflow',
        `result should have 'value overflow' error set (${txType.name})`
      )
      t.equal(
        (<any>vm.stateManager)._checkpointCount,
        0,
        `checkpoint count should be 0 (${txType.name})`
      )
    }
    t.end()
  })
})

// TODO: complete on result values and add more usage scenario test cases
tape('runTx() -> API return values', async (t) => {
  t.test('simple run,common return values', async (t) => {
    for (const txType of TRANSACTION_TYPES) {
      const vm = new VM({ common })
      const tx = getTransaction(vm._common, txType.type, true)

      const caller = tx.getSenderAddress()
      const acc = createAccount()
      await vm.stateManager.putAccount(caller, acc)

      const res = await vm.runTx({ tx })
      t.true(res.execResult.gasUsed.eqn(0), `execution result -> gasUsed -> 0 (${txType.name})`)
      t.equal(
        res.execResult.exceptionError,
        undefined,
        `execution result -> exception error -> undefined (${txType.name})`
      )
      t.deepEqual(
        res.execResult.returnValue,
        Buffer.from([]),
        `execution result -> return value -> empty Buffer (${txType.name})`
      )
      t.true(
        res.execResult.gasRefund!.eqn(0),
        `execution result -> gasRefund -> 0 (${txType.name})`
      )
    }
    t.end()
  })
})
