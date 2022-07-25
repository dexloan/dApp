import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import { getProgram, getProvider } from "../provider";
import { findListingAddress } from "../query";
import { LISTINGS_PROGRAM_ID } from "../constants";

/**
 * Deprecated methods
 */
export async function cancelListing(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const listingAccount = await findListingAddress(mint, wallet.publicKey);
  const [escrowAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("escrow"), mint.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  await program.methods
    .cancelListing()
    .accounts({
      escrowAccount,
      listingAccount,
      mint,
      borrowerDepositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function closeAccount(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  listingAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .closeListing()
    .accounts({
      listingAccount,
      borrower: wallet.publicKey,
    })
    .rpc();
}
