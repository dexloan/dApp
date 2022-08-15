import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { HireData } from "../types";
import { getProgram, getProvider } from "../provider";

export async function initCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
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

  const [edition] = await query.findEditionAddress(mint);
  const callOption = await query.findCallOptionAddress(mint, wallet.publicKey);
  const hire = await query.findHireAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  let hireData: HireData | null = null;

  try {
    hireData = await program.account.hire.fetch(hire);
  } catch {
    // Does not exist
  }

  if (hireData?.borrower) {
    await program.methods
      .initCallOptionWithHire(amount, strikePrice, expiry)
      .accounts({
        callOption,
        hire,
        tokenManager,
        mint,
        edition,
        seller: wallet.publicKey,
        hireBorrower: hireData?.borrower,
        hireTokenAccount: tokenAccount,
        metadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
  } else {
    await program.methods
      .initCallOption(amount, strikePrice, expiry)
      .accounts({
        callOption,
        tokenManager,
        mint,
        edition,
        seller: wallet.publicKey,
        depositTokenAccount: tokenAccount,
        metadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
  }
}

export async function buyCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [edition] = await query.findEditionAddress(mint);
  const callOption = await query.findCallOptionAddress(mint, seller);
  const tokenManager = await query.findTokenManagerAddress(mint, seller);

  await program.methods
    .buyCallOption()
    .accounts({
      callOption,
      tokenManager,
      mint,
      edition,
      seller,
      buyer: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
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
  seller: anchor.web3.PublicKey,
  metadata: Metadata
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOption = await query.findCallOptionAddress(mint, seller);
  const tokenManager = await query.findTokenManagerAddress(mint, seller);
  const hire = await query.findHireAddress(mint, seller);
  const hireEscrow = await query.findHireEscrowAddress(mint, seller);
  const [metadataAddress] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  let hireAccount: HireData | null = null;

  try {
    hireAccount = await program.account.hire.fetch(hire);
  } catch (err) {
    // account does not exist
  }

  if (hireAccount) {
    console.log("borrower", hireAccount.borrower?.toBase58());
    console.log("escrowBalance", hireAccount.escrowBalance?.toNumber());
    console.log("tokenManager", tokenManager.toBase58());
    console.log("tokenAccount", tokenAccount.toBase58());

    const method = program.methods.exerciseCallOptionWithHire().accounts({
      buyerTokenAccount,
      callOption,
      tokenManager,
      hire,
      hireEscrow,
      mint,
      edition,
      seller,
      tokenAccount,
      buyer: wallet.publicKey,
      metadata: metadataAddress,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    });

    const remainingAccounts = [];

    if (hireAccount.borrower) {
      remainingAccounts.push({
        isSigner: false,
        isWritable: true,
        pubkey: hireAccount.borrower,
      });
    }

    if (creatorAccounts?.length) {
      remainingAccounts.push(...creatorAccounts);
    }

    if (remainingAccounts.length) {
      method.remainingAccounts(remainingAccounts);
    }

    await method.rpc();
  } else {
    const method = program.methods.exerciseCallOption().accounts({
      buyerTokenAccount,
      callOption,
      tokenManager,
      mint,
      edition,
      seller,
      buyer: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      metadata: metadataAddress,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    });

    if (creatorAccounts?.length) {
      method.remainingAccounts(creatorAccounts);
    }

    await method.rpc();
  }
}

export async function closeCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOption = await query.findCallOptionAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );

  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .closeCallOption()
    .accounts({
      depositTokenAccount,
      callOption,
      tokenManager,
      mint,
      edition,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}
