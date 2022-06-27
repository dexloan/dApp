import * as anchor from "@project-serum/anchor";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { CallOptionResult } from "../types";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";

export async function findCallOptionAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [callOptionAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("call_option"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return callOptionAddress;
}

export async function fetchCallOption(
  connection: anchor.web3.Connection,
  callOption: anchor.web3.PublicKey
): Promise<CallOptionResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const callOptionAccount = await program.account.callOption.fetch(callOption);

  assertMintIsWhitelisted(callOptionAccount.mint);

  const metadata = await fetchMetadata(connection, callOptionAccount.mint);

  return {
    metadata,
    publicKey: callOption,
    data: callOptionAccount,
  };
}

export async function fetchMultipleCallOptions(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<CallOptionResult[]> {
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

  return combinedAccounts.filter(Boolean) as CallOptionResult[];
}
