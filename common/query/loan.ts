import * as anchor from "@project-serum/anchor";

import * as utils from "../utils";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { LoanData, LoanOfferData } from "../types";
import { Loan, LoanPretty, LoanOffer, LoanOfferPretty } from "../model";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";

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

export async function fetchLoan(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<LoanPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const loanAccount = await program.account.loan.fetch(address);

  const metadata = await fetchMetadata(connection, loanAccount.mint);

  return new Loan(loanAccount as LoanData, metadata, address).pretty();
}

export async function waitForLoan(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<LoanPretty> {
  async function tryFetchLoan(retry: number): Promise<LoanPretty> {
    await utils.wait(800);

    if (retry > 3) {
      throw new Error("Max retries");
    }

    try {
      const loan = await fetchLoan(connection, address);
      return loan;
    } catch {
      return tryFetchLoan(retry + 1);
    }
  }

  return tryFetchLoan(0);
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

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new Loan(
        listing.account as LoanData,
        metadataAccount,
        listing.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as LoanPretty[];
}

export async function fetchMultipleLoanOffers(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanOfferPretty[]> {
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

  return listings
    .map((listing) => {
      const collection = collections.find((col) =>
        col.publicKey.equals(listing.account.collection)
      );

      if (collection) {
        const metadata = metadataAccounts.find((acc) =>
          acc?.mint.equals(collection.account.mint)
        );

        if (metadata) {
          return new LoanOffer(
            listing.account as LoanOfferData,
            metadata,
            listing.publicKey
          ).pretty();
        }
      }

      return null;
    })
    .filter(Boolean) as LoanOfferPretty[];
}
