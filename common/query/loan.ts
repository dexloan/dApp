import * as anchor from "@project-serum/anchor";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { LoanResult, Loan } from "../types";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";

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

export async function fetchLoan(
  connection: anchor.web3.Connection,
  loan: anchor.web3.PublicKey
): Promise<LoanResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const loanAccount = await program.account.loan.fetch(loan);

  assertMintIsWhitelisted(loanAccount.mint);

  const metadata = await fetchMetadata(connection, loanAccount.mint);

  return {
    metadata,
    publicKey: loan,
    data: loanAccount as Loan,
  };
}

export async function fetchMultipleLoans(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.loan
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
      return {
        metadata: metadataAccount,
        publicKey: listing.publicKey,
        data: listing.account,
      };
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as LoanResult[];
}
