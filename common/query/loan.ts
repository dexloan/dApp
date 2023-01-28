import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import * as utils from "../utils";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { CollectionData, LoanData, LoanJson, LoanOfferData } from "../types";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";

/**
 * KEYS
 */
// export const loanKeys = {
//   all: () => ["loans"] as const,
//   list: (filter: anchor.web3.GetProgramAccountsFilter[] = []) =>
//     ["loans", "list", ...filter] as const,
//   byAddress: (address: anchor.web3.PublicKey) =>
//     ["loans", "details", address.toBase58()] as const,
// };

// export const offerKeys = {
//   all: () => ["offers"] as const,
//   list: (filter: anchor.web3.GetProgramAccountsFilter[] = []) =>
//     ["offers", "list", ...filter] as const,
//   byAddress: (address: anchor.web3.PublicKey) =>
//     ["offers", "details", address.toBase58()] as const,
// };

/**
 * PDAs
 */
export async function findLoanAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [loanAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("loan"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return loanAddress;
}

export async function findLoanOfferAddress(
  collection: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  id: number
): Promise<anchor.web3.PublicKey> {
  const [loanOfferAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("loan_offer"),
      collection.toBuffer(),
      lender.toBuffer(),
      new anchor.BN(id).toArrayLike(Buffer),
    ],
    LISTINGS_PROGRAM_ID
  );

  return loanOfferAddress;
}

export async function findLoanOfferVaultAddress(
  loanOffer: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [vaultAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("loan_offer_vault"), loanOffer.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return vaultAddress;
}

export async function fetchMultipleLoans(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.loan.all(filter);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    listings.map((l) => l.account.mint)
  );

  return listings
    .map((listing, index) => {
      const metadataAccount = metadataAccounts[index];

      if (metadataAccount) {
        return new Loan(
          listing.account as LoanData,
          metadataAccount,
          listing.publicKey
        ).pretty();
      }
      return null;
    })
    .filter(utils.notNull);
}

export async function fetchMultipleLoanOffers(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanOfferPretty[][]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const [listings, collections] = await Promise.all([
    program.account.loanOffer.all(filter),
    program.account.collection.all(),
  ]);
  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    collections.map((c) => c.account.mint)
  );
  const collectionMap = collections.reduce((prev, curr) => {
    prev[curr.publicKey.toBase58()] = curr.account;
    return prev;
  }, {} as Record<string, CollectionData>);

  const metadataMap = metadataAccounts.reduce((prev, curr) => {
    prev[curr.mint.toBase58()] = curr;
    return prev;
  }, {} as Record<string, Metadata>);

  const listingsMap = listings
    .map((listing) => {
      const collectionData =
        collectionMap[listing.account.collection.toBase58()];
      const metadata = metadataMap[collectionData.mint.toBase58()];

      if (collectionData && metadata) {
        const collection = new Collection(
          collectionData,
          metadata,
          listing.account.collection
        );

        return new LoanOffer(
          listing.account as LoanOfferData,
          collection,
          listing.publicKey
        ).pretty();
      }

      return null;
    })
    .filter(utils.notNull)
    .reduce((map, offer) => {
      const key = `${offer.data.collection}:
        ${offer.data.amount}:
        ${offer.data.basisPoints}:
        ${offer.data.duration}`;

      map[key] = map[key] || [];
      map[key].push(offer);

      return map;
    }, {} as Record<string, LoanOfferPretty[]>);

  return Object.values(listingsMap);
}
