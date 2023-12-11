import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { Users } from "../target/types/users";
import { sleep } from "../misc/utils";
// Setup wallets
const acc1 = anchor.web3.Keypair.generate();
const acc2 = anchor.web3.Keypair.generate();

describe("users", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Users as anchor.Program<Users>;
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  before(async () => {
    // //AirDrop
    await provider.connection.requestAirdrop(acc1.publicKey, 10000000000);
    await provider.connection.requestAirdrop(acc2.publicKey, 10000000000);
    await sleep(500);
  });

  let acc1PDA = null;
  let acc2PDA = null;
  it("create acc1", async () => {
    const createUser = async (acc: web3.Keypair) => {
      const [pda] = web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("user_acc"), acc.publicKey.toBuffer()],
        program.programId
      );
      await program.methods
        .createUser()
        .accounts({
          owner: acc.publicKey,
          userAcc: pda,
        })
        .signers([acc])
        .rpc();
      await sleep(100);

      const balance = (
        await program.account.userAcc.fetch(pda)
      ).balance.toNumber();

      console.log(`balance:    ${balance}`);

      return pda;
    };

    acc1PDA = await createUser(acc1);
    acc2PDA = await createUser(acc2);
    await sleep(1000);
  });
  it("transfer", async () => {
    await program.methods
      .transfer(new anchor.BN(5))
      .accounts({
        sender: acc1.publicKey,
        senderAcc: acc1PDA,
        receiverAcc: acc2PDA,
      })
      .signers([acc1])
      .rpc();
    await sleep(500);
    const balance1 = (
      await program.account.userAcc.fetch(acc1PDA)
    ).balance.toNumber();
    const balance2 = (
      await program.account.userAcc.fetch(acc2PDA)
    ).balance.toNumber();
    console.log(`balance1: ${balance1}`);
    console.log(`balance2: ${balance2}`);
  });
});
