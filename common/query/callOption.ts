import * as anchor from "@project-serum/anchor";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";
import { CallOption, CallOptionPretty } from "../model/callOption";

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
  address: anchor.web3.PublicKey
): Promise<CallOptionPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const callOptionAccount = await program.account.callOption.fetch(address);

  assertMintIsWhitelisted(callOptionAccount.mint);

  const metadata = await fetchMetadata(connection, callOptionAccount.mint);

  return new CallOption(callOptionAccount, metadata, address).pretty();
}

export async function fetchMultipleCallOptions(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<CallOptionPretty[]> {
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
      return new CallOption(
        listing.account,
        metadataAccount,
        listing.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as CallOptionPretty[];
}
