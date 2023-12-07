import * as web3 from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import type { Users } from '../target/types/users'
import { sleep } from '../misc/utils'
// Setup wallets
const Alice = anchor.web3.Keypair.generate()
const Julka = anchor.web3.Keypair.generate()
describe('users', () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env())
  const program = anchor.workspace.Users as anchor.Program<Users>
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  before(async () => {
    // //AirDrop
    await provider.connection.requestAirdrop(Alice.publicKey, 10000000000)
    await provider.connection.requestAirdrop(Julka.publicKey, 10000000000)
    await sleep(500)
  })

  // const payer = provider.wallet as anchor.Wallet
  // const [payerKey] = web3.PublicKey.findProgramAddressSync(
  //   [anchor.utils.bytes.utf8.encode('user_acc'), payer.publicKey.toBuffer()],
  //   program.programId
  // )

  // const reciever = new web3.Keypair()
  // const [recieverKey] = web3.PublicKey.findProgramAddressSync(
  //   [anchor.utils.bytes.utf8.encode('user_acc'), reciever.publicKey.toBuffer()],
  //   program.programId
  // )

  // async function getBalances() {
  //   let [payerBalance, recieverBalance] = [0, 0]

  //   try {
  //     payerBalance = (await program.account.userAcc.fetch(payerKey)).balance.toNumber()
  //     console.log(`payer:    ${payerBalance}`)
  //   } catch (e) {
  //     console.log('payer err:   ', e)
  //   }

  //   try {
  //     recieverBalance = (await program.account.userAcc.fetch(recieverKey)).balance.toNumber()
  //     console.log(`reciever: ${recieverBalance}`)
  //   } catch (e) {
  //     console.log('reciever err:', e)
  //   }

  //   return [payerBalance, recieverBalance]
  // }

  it('Alice => create account', async () => {
    const [alicePDA] = web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('user_acc'), Alice.publicKey.toBuffer()],
      program.programId
    )
    await program.methods
      .createUser()
      .accounts({
        owner: Alice.publicKey,
        userAcc: alicePDA,
      })
      .signers([Alice])
      .rpc()
    await sleep(100)
    const aliceBalance = (await program.account.userAcc.fetch(alicePDA)).balance.toNumber()
    console.log(`alice:    ${aliceBalance}`)
    // Julka
    const [julkaPDA] = web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('user_acc'), Julka.publicKey.toBuffer()],
      program.programId
    )
    await program.methods
      .createUser()
      .accounts({
        owner: Julka.publicKey,
        userAcc: julkaPDA,
      })
      .signers([Julka])
      .rpc()
    await sleep(100)
    const JulkaBalance = (await program.account.userAcc.fetch(julkaPDA)).balance.toNumber()
    console.log(`Julka:    ${JulkaBalance}`)
    await program.methods
      .transfer(new anchor.BN(9))
      .accounts({
        sender: Julka.publicKey,
        senderAcc: julkaPDA,
        receiverAcc: alicePDA,
      })
      .signers([Julka])
      .rpc()
    await sleep(100)
    const aliceBalance2 = (await program.account.userAcc.fetch(alicePDA)).balance.toNumber()
    console.log(`alice:    ${aliceBalance2}`)
    const JulkaBalance2 = (await program.account.userAcc.fetch(julkaPDA)).balance.toNumber()
    console.log(`Julka:    ${JulkaBalance2}`)
  })

  // it('transfer', async () => {

  //   await program.methods
  //     .transfer(new anchor.BN(ammount))
  //     .accounts({
  //       payer: payerKey,
  //       reciever: recieverKey,
  //     })
  //     .rpc()

  //   const [p, r] = await getBalances()
  //   assert(p == 6, "wrong payer's balance after transfer, should be 6")
  //   assert(r == 14, "wrong reciever's balance after tronsfer, should be 14")
  // })
})
