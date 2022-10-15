import * as anchor from "@project-serum/anchor";
import { Collection, CollectionPretty } from "../model";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

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
): Promise<CollectionPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const data = await program.account.collection.fetch(address);
  const metadata = await fetchMetadata(connection, data.mint);

  return new Collection(data, metadata, address).pretty();
}

export async function fetchMultipleCollections(
  connection: anchor.web3.Connection
): Promise<CollectionPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const collections = await program.account.collection.all();
  const metadataAccounts = await fetchMetadataAccounts(connection, collections);

  return collections
    .map((collection, index) => {
      const metadata = metadataAccounts[index];

      if (metadata) {
        return new Collection(
          collection.account,
          metadata,
          collection.publicKey
        ).pretty();
      }
      return null;
    })
    .filter(Boolean) as CollectionPretty[];
}
