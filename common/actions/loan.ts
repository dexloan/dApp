import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { getProgram, getProvider } from "../provider";

/**
 * Loans
 */

export async function initLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey,
  options: {
    amount: number;
    duration: number;
    basisPoints: number;
  }
) {
  const amount = new anchor.BN(options.amount);
  const basisPoint = options.basisPoints;
  const duration = new anchor.BN(options.duration);

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await query.findLoanAddress(mint, wallet.publicKey);
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .initLoan(amount, basisPoint, duration)
    .accounts({
      loanAccount,
      mint,
      edition,
      depositTokenAccount,
      borrower: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}

export async function giveLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await query.findLoanAddress(mint, borrower);

  await program.methods
    .giveLoan()
    .accounts({
      borrower,
      mint,
      loanAccount,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function closeLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await query.findLoanAddress(mint, wallet.publicKey);
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .closeLoan()
    .accounts({
      loanAccount,
      mint,
      edition,
      depositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function repayLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await query.findLoanAddress(mint, wallet.publicKey);
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .repayLoan()
    .accounts({
      lender,
      loanAccount,
      mint,
      edition,
      borrower: wallet.publicKey,
      depositTokenAccount: borrowerTokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function repossessCollateral(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey,
  lenderTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await query.findLoanAddress(mint, borrower);
  const [edition] = await query.findEditionAddress(mint);

  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  await program.methods
    .repossessCollateral()
    .accounts({
      mint,
      edition,
      depositTokenAccount,
      lenderTokenAccount,
      loanAccount,
      borrower,
      lender: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}
