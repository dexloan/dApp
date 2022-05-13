import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { getProgram, getProvider } from "./provider";

export async function fetchListings(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
) {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.listing.all(filter);

  const filteredListings = listings.sort(
    (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
  );

  const metadataAddresses = await Promise.all(
    filteredListings.map((listing) =>
      anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          listing.account.mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      ).then(([address]) => address)
    )
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = rawMetadataAccounts[index];

    if (metadataAccount) {
      try {
        const [metadata] = Metadata.fromAccountInfo(metadataAccount);

        return {
          metadata,
          listing,
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    }
    return null;
  });

  return combinedAccounts.filter(Boolean);
}
