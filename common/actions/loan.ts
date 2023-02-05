import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { SIGNER } from "../constants";
import { RentalData, LoanOfferJson } from "../types";
import { getProgram, getProvider } from "../provider";
import { submitTransaction } from "./common";

export async function askLoan(
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
    .askLoan(amount, basisPoint, duration)
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

export async function offerLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  collection: anchor.web3.PublicKey,
  collectionMint: anchor.web3.PublicKey,
  options: {
    amount: number;
    duration: number;
    basisPoints: number;
  },
  ids: number[]
) {
  const tx = new anchor.web3.Transaction();

  for (const id of ids) {
    const amount = new anchor.BN(options.amount);
    const basisPoint = options.basisPoints;
    const duration = new anchor.BN(options.duration);

    const provider = getProvider(connection, wallet);
    const program = getProgram(provider);

    const loanOffer = await query.findLoanOfferAddress(
      collectionMint,
      wallet.publicKey,
      id
    );
    const loanOfferVault = await query.findLoanOfferVaultAddress(loanOffer);

    const accounts = {
      loanOffer,
      collection,
      escrowPaymentAccount: loanOfferVault,
      lender: wallet.publicKey,
      signer: SIGNER,
    };

    const ix = await program.methods
      .offerLoan(amount, basisPoint, duration, id)
      .accounts(accounts)
      .instruction();

    tx.add(ix);
  }

  await submitTransaction(connection, wallet, tx);
}

export async function closeOffer(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  offer: LoanOfferJson
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanOffer = new anchor.web3.PublicKey(offer.address);
  const collection = new anchor.web3.PublicKey(offer.collectionAddress);
  const escrowPaymentAccount = await query.findLoanOfferVaultAddress(loanOffer);

  const transaction = await program.methods
    .closeLoanOffer(offer.offerId)
    .accounts({
      loanOffer,
      collection,
      escrowPaymentAccount,
      signer: SIGNER,
      lender: wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function takeLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  offer: LoanOfferJson
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const loanOffer = new anchor.web3.PublicKey(offer.address);
  const lender = new anchor.web3.PublicKey(offer.lender);
  const collection = new anchor.web3.PublicKey(offer.collectionAddress);
  const loan = await query.findLoanAddress(mint, wallet.publicKey);
  const loanOfferVault = await query.findLoanOfferVaultAddress(loanOffer);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;
  const [metadata] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .takeLoanOffer(offer.offerId)
    .accounts({
      lender,
      loan,
      loanOffer,
      tokenManager,
      collection,
      mint,
      metadata,
      edition,
      borrower: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      escrowPaymentAccount: loanOfferVault,
      systemProgram: anchor.web3.SystemProgram.programId,
      metadataProgram: METADATA_PROGRAM_ID,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
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
  const [metadataPda] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);
  const metadata = await Metadata.fromAccountAddress(connection, metadataPda);

  const remainingAccounts = [];
  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  if (creatorAccounts?.length) {
    remainingAccounts.push(...creatorAccounts);
  }

  const transaction = await program.methods
    .repayLoan()
    .accounts({
      lender,
      loan,
      tokenManager,
      mint,
      metadata: metadataPda,
      edition,
      borrower: wallet.publicKey,
      depositTokenAccount: borrowerTokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .remainingAccounts(remainingAccounts)
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
  const rental = await query.findRentalAddress(mint, borrower);
  const rentalEscrow = await query.findRentalEscrowAddress(mint, borrower);
  const tokenManager = await query.findTokenManagerAddress(mint, borrower);
  const [edition] = await query.findEditionAddress(mint);

  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  let hireAccount: RentalData | null = null;

  try {
    hireAccount = (await program.account.rental.fetch(rental)) as RentalData;
  } catch (err) {
    // account does not exist
  }

  if (hireAccount) {
    const method = program.methods.repossessWithRental().accounts({
      loan,
      tokenManager,
      mint,
      edition,
      lenderTokenAccount,
      borrower,
      rental,
      rentalEscrow,
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
