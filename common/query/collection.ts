import * as anchor from "@project-serum/anchor";
import { Collection } from "../types";
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

type CollectionResult = {
  data: Collection;
  metadata: Metadata;
  publicKey: anchor.web3.PublicKey;
};

export async function fetchCollection(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<CollectionResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const data = await program.account.collection.fetch(address);
  const metadata = await fetchMetadata(connection, data.mint);

  return { data, metadata, publicKey: address };
}

export async function fetchMultipleCollections(
  connection: anchor.web3.Connection
): Promise<CollectionResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const collections = await program.account.collection.all();
  const metadataAccounts = await fetchMetadataAccounts(connection, collections);

  return collections
    .map((collection, index) => {
      if (metadataAccounts[index]) {
        return {
          data: collection.account,
          publicKey: collection.publicKey,
          metadata: metadataAccounts[index],
        };
      }
      return null;
    })
    .filter(Boolean) as CollectionResult[];
}
