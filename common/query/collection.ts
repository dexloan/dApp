import * as anchor from "@project-serum/anchor";
import { Collection } from "../types";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";

export async function findCollectionAddress(
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [collectionAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("collection"), mint.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return collectionAddress;
}

export async function fetchCollection(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<Collection> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const collectionAccount = await program.account.collection.fetch(address);

  return collectionAccount;
}

export async function fetchMultipleCollections(
  connection: anchor.web3.Connection
): Promise<Collection[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const collectionAccounts =
    // @ts-ignore
    (await program.account.collection.all()) as Collection[]; // TODO ??

  return collectionAccounts;
}
