import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { Users } from "../target/types/users";
// Setup wallets

describe("users", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Users as anchor.Program<Users>;
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
});
