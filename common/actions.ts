import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";

import { LISTINGS_PROGRAM_ID } from "./constants";
import { getProgram, getProvider } from "./provider";
import {
  findEscrowAddress,
  findListingAddress,
  findLoanAddress,
} from "./query";

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
    .makeLoan()
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
  lenderTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanAccount = await findLoanAddress(mint, wallet.publicKey);
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

/**
 * Call Options
 */

export async function initCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey,
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  }
) {
  const amount = new anchor.BN(options.amount);
  const strikePrice = new anchor.BN(options.strikePrice);
  const expiry = new anchor.BN(options.expiry);

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await findCallOptionAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .initCallOption(amount, strikePrice, expiry)
    .accounts({
      mint,
      escrowAccount,
      callOptionAccount,
      seller: wallet.publicKey,
      depositTokenAccount,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function buyCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [escrowAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("escrow"), mint.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  const callOptionAccount = await findCallOptionAddress(mint, wallet.publicKey);

  await program.methods
    .buyCallOption()
    .accounts({
      escrowAccount,
      callOptionAccount,
      depositTokenAccount,
      mint,
      seller,
      buyer: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function exerciseCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  buyerTokenAccount: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await findCallOptionAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .exerciseCallOption()
    .accounts({
      buyer: wallet.publicKey,
      buyerTokenAccount,
      callOptionAccount,
      escrowAccount,
      mint,
      seller,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}

export async function closeCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await findCallOptionAddress(mint, wallet.publicKey);
  const escrowAccount = await findEscrowAddress(mint);

  await program.methods
    .closeCallOption()
    .accounts({
      depositTokenAccount,
      mint,
      callOptionAccount,
      escrowAccount,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

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
  const escrowAccount = await findEscrowAddress(mint);

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

export async function getOrCreateTokenAccount(
  connection: anchor.web3.Connection,
  wallet: WalletContextState,
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  if (!wallet.publicKey) {
    throw new Error("No wallet");
  }

  const response = await connection.getTokenAccountsByOwner(wallet.publicKey, {
    mint,
  });

  let tokenAccount: anchor.web3.PublicKey | undefined;

  // Ensure existing token account is rent exempt
  if (response.value[0]) {
    const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(
      response.value[0].account.data.length
    );

    if (response.value[0].account.lamports >= rentExemptAmount) {
      tokenAccount = response.value[0].pubkey;
    }
  }

  if (tokenAccount === undefined) {
    [tokenAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        splToken.TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const receiverAccount = await connection.getAccountInfo(tokenAccount);

    if (!receiverAccount) {
      const transaction = new anchor.web3.Transaction({
        feePayer: wallet.publicKey,
      });

      transaction.add(
        splToken.createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          tokenAccount,
          wallet.publicKey,
          mint,
          splToken.TOKEN_PROGRAM_ID,
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      const txId = await wallet.sendTransaction(transaction, connection);

      await connection.confirmTransaction(txId);
    }
  }

  if (tokenAccount === undefined) {
    throw new Error("Could not create token account");
  }

  return tokenAccount;
}
