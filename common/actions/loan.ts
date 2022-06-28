import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import { getProgram, getProvider } from "../provider";
import { findEscrowAddress, findLoanAddress } from "../query";

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

  const loanAccount = await findLoanAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .initLoan(amount, basisPoint, duration)
    .accounts({
      escrowAccount,
      loanAccount,
      mint,
      depositTokenAccount,
      borrower: wallet.publicKey,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
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

  const loanAccount = await findLoanAddress(mint, borrower);

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

  const loanAccount = await findLoanAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .closeLoan()
    .accounts({
      escrowAccount,
      loanAccount,
      mint,
      depositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
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

  const loanAccount = await findLoanAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .repayLoan()
    .accounts({
      lender,
      loanAccount,
      escrowAccount,
      mint,
      depositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
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

  const loanAccount = await findLoanAddress(mint, borrower);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .repossessCollateral()
    .accounts({
      escrowAccount,
      mint,
      lenderTokenAccount,
      loanAccount,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}
