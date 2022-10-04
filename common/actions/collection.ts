import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import { getProgram, getProvider } from "../provider";
import { SIGNER } from "../constants";
import { submitTransaction } from "./common";
import * as query from "../query";

export async function initCollection(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const collectionAddress = await query.findCollectionAddress(mint);

  const transaction = await program.methods
    .initCollection()
    .accounts({
      mint,
      collection: collectionAddress,
      authority: wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function closeCollection(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const collectionAddress = await query.findCollectionAddress(mint);

  const transaction = await program.methods
    .closeCollection()
    .accounts({
      mint,
      collection: collectionAddress,
      authority: wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}
