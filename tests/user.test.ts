import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { Users } from "../target/types/users";
import { sleep } from "../misc/utils";
import { PublicKey } from "@solana/web3.js";

import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// Setup wallets
const acc1 = anchor.web3.Keypair.generate();
const acc2 = anchor.web3.Keypair.generate();
const mint = anchor.web3.Keypair.generate();
const mint_wallet = anchor.web3.Keypair.generate();
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

      return pda;
    };

    acc1PDA = await createUser(acc1);
    acc2PDA = await createUser(acc2);
    await sleep(1000);
  });
  it("initialize mints on pda", async () => {
    const tx = await program.methods
      .initializeMint()
      .accounts({
        mint: mint.publicKey,
        payer: acc1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        authority: acc1.publicKey,
      })
      .signers([acc1, mint])
      .rpc();
  });
  it("mint tokens", async () => {
    // Tworzenie i inicjowanie konta ATA
    const createATAIx = await createAssociatedTokenAccountInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      acc1PDA,
      acc1.publicKey
    );

    const tx = new web3.Transaction().add(createATAIx);
    const signedTx = await provider.sendAndConfirm(tx, [acc1]);

    console.log(signedTx);
    await sleep(1000);
    const ata = await getAssociatedTokenAddress(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      acc1PDA
    );
    const [pda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("user_acc"))],
      program.programId
    );
    await program.methods
      .mintToken(bump, new anchor.BN(100))
      .accounts({
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenAccount: ata,
        authority: acc1PDA.publicKey,
      })
      .signers([acc1PDA])
      .rpc();
  });
});
