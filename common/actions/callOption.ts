import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { getProgram, getProvider } from "../provider";

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

  const [edition] = await query.findEditionAddress(mint);
  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );

  await program.methods
    .initCallOption(amount, strikePrice, expiry)
    .accounts({
      mint,
      edition,
      callOptionAccount,
      seller: wallet.publicKey,
      depositTokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
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
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [edition] = await query.findEditionAddress(mint);
  const callOptionAccount = await query.findCallOptionAddress(mint, seller);

  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  await program.methods
    .buyCallOption()
    .accounts({
      callOptionAccount,
      depositTokenAccount,
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

  const callOptionAccount = await query.findCallOptionAddress(mint, seller);
  const [metadataAddress] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  const method = program.methods.exerciseCallOption().accounts({
    buyerTokenAccount,
    depositTokenAccount,
    callOptionAccount,
    mint,
    edition,
    seller,
    buyer: wallet.publicKey,
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

export async function closeCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .closeCallOption()
    .accounts({
      depositTokenAccount,
      callOptionAccount,
      mint,
      edition,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}
