import * as anchor from "@project-serum/anchor";
import { LISTINGS_PROGRAM_ID } from "../constants";

export async function findCollectionAddress(
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [collectionAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("collection"), mint.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return collectionAddress;
}
