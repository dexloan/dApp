import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { SIGNER } from "../constants";
import { HireData } from "../types";
import { getProgram, getProvider } from "../provider";
import { submitTransaction } from "./common";

export async function initLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  collectionMint: anchor.web3.PublicKey,
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

  const loan = await query.findLoanAddress(mint, wallet.publicKey);
  const collection = await query.findCollectionAddress(collectionMint);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;
  const [metadata] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .initLoan(amount, basisPoint, duration)
    .accounts({
      loan,
      tokenManager,
      collection,
      mint,
      edition,
      metadata,
      depositTokenAccount: tokenAccount,
      borrower: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function giveLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loan = await query.findLoanAddress(mint, borrower);
  const tokenManager = await query.findTokenManagerAddress(mint, borrower);

  const transaction = await program.methods
    .giveLoan()
    .accounts({
      borrower,
      mint,
      loan,
      tokenManager,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function closeLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loan = await query.findLoanAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .closeLoan()
    .accounts({
      loan,
      tokenManager,
      mint,
      edition,
      depositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
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

  const loan = await query.findLoanAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .repayLoan()
    .accounts({
      lender,
      loan,
      tokenManager,
      mint,
      edition,
      borrower: wallet.publicKey,
      depositTokenAccount: borrowerTokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
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

  const loan = await query.findLoanAddress(mint, borrower);
  const hire = await query.findHireAddress(mint, borrower);
  const hireEscrow = await query.findHireEscrowAddress(mint, borrower);
  const tokenManager = await query.findTokenManagerAddress(mint, borrower);
  const [edition] = await query.findEditionAddress(mint);

  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  let hireAccount: HireData | null = null;

  try {
    hireAccount = (await program.account.hire.fetch(hire)) as HireData;
  } catch (err) {
    // account does not exist
  }

  if (hireAccount) {
    const method = program.methods.repossessWithHire().accounts({
      loan,
      tokenManager,
      mint,
      edition,
      lenderTokenAccount,
      borrower,
      hire,
      hireEscrow,
      tokenAccount,
      lender: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      signer: SIGNER,
    });

    if (hireAccount.borrower) {
      method.remainingAccounts([
        {
          isSigner: false,
          isWritable: true,
          pubkey: hireAccount.borrower,
        },
      ]);
    }

    const transaction = await method.transaction();
    await submitTransaction(connection, wallet, transaction);
  } else {
    const transaction = await program.methods
      .repossess()
      .accounts({
        loan,
        tokenManager,
        mint,
        edition,
        borrower,
        lenderTokenAccount,
        depositTokenAccount: tokenAccount,
        lender: wallet.publicKey,
        metadataProgram: METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        signer: SIGNER,
      })
      .transaction();

    await submitTransaction(connection, wallet, transaction);
  }
}
