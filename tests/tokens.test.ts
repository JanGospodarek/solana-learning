import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { Users } from "../target/types/users";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { sleep } from "../misc/utils";

describe("users", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Users as anchor.Program<Users>;

  let associatedTokenAccount = undefined;
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  it("mint a token", async () => {
    const key = provider.wallet.publicKey;

    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );

    associatedTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      key
    );

    const mint_tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: key,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      createInitializeMintInstruction(mintKey.publicKey, 0, key, key),
      createAssociatedTokenAccountInstruction(
        key,
        associatedTokenAccount,
        key,
        mintKey.publicKey
      )
    );
    await provider.sendAndConfirm(mint_tx, [mintKey]);

    const tx = program.methods
      .mintToken()
      .accounts({
        mint: mintKey.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenAccount: associatedTokenAccount,
        payer: key,
      })
      .rpc();
    console.log(tx);
    await sleep(1000);
    const minted = (
      await program.provider.connection.getParsedAccountInfo(
        associatedTokenAccount
      )
    ).value.data.parsed.info.tokenAmount.amount;

    await sleep(1000);

    console.log(minted);
  });
  it("transfer token", async () => {
    const myWallet = provider.wallet.publicKey;
    const toWallet = web3.Keypair.generate();

    const toATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      toWallet.publicKey
    );

    const mint_tx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        myWallet,
        toATA,
        toWallet.publicKey,
        mintKey.publicKey
      )
    );

    await provider.sendAndConfirm(mint_tx, []);
    await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount,
        signer: myWallet,
        to: toATA,
      })
      .rpc();
    await sleep(1000);

    const mintedFrom = (
      await program.provider.connection.getParsedAccountInfo(
        associatedTokenAccount
      )
    ).value.data.parsed.info.tokenAmount.amount;

    const mintedTo = (
      await program.provider.connection.getParsedAccountInfo(toATA)
    ).value.data.parsed.info.tokenAmount.amount;

    await sleep(1000);

    console.log(mintedFrom, mintedTo);
  });
});
