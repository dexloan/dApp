import * as anchor from "@project-serum/anchor";
import bs58 from "bs58";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { ListingResult, ListingState } from "../types";
import { Loan, LoanPretty } from "../model";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";

export async function findListingAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [listingAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("listing"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return listingAccount;
}

export async function fetchListing(
  connection: anchor.web3.Connection,
  listing: anchor.web3.PublicKey
): Promise<LoanPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const listingAccount = await program.account.listing.fetch(listing);

  assertMintIsWhitelisted(listingAccount.mint);

  const metadata = await fetchMetadata(connection, listingAccount.mint);

  return new Loan(listingAccount, metadata, listing).pretty();
}

export async function fetchMultipleListings(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.listing
    .all(filter)
    .then((result) =>
      result.sort(
        (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
      )
    );

  const metadataAccounts = await fetchMetadataAccounts(connection, listings);

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new Loan(
        listing.account,
        metadataAccount,
        listing.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as LoanPretty[];
}

export const fetchActiveListings = (connection: anchor.web3.Connection) => {
  return fetchMultipleListings(connection, [
    {
      memcmp: {
        // filter active
        offset: 7 + 1,
        bytes: bs58.encode(
          new anchor.BN(ListingState.Active).toArrayLike(Buffer)
        ),
      },
    },
  ]);
};
