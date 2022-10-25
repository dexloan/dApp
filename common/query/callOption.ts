import * as anchor from "@project-serum/anchor";

import * as utils from "../utils";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { CallOptionData, CallOptionBidData } from "../types";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";
import {
  CallOption,
  CallOptionBid,
  CallOptionBidPretty,
  CallOptionPretty,
} from "../model/callOption";

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

export async function findCallOptionBidAddress(
  collection: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey,
  id: number
) {
  const [callOptionBidAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("call_option_bid"),
      collection.toBuffer(),
      buyer.toBuffer(),
      new anchor.BN(id).toArrayLike(Buffer),
    ],
    LISTINGS_PROGRAM_ID
  );

  return callOptionBidAddress;
}

export async function findCallOptionBidTreasury(
  callOptionBid: anchor.web3.PublicKey
) {
  const [vaultAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("call_option_bid_vault"), callOptionBid.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return vaultAddress;
}

export async function fetchCallOption(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<CallOptionPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const callOptionAccount = await program.account.callOption.fetch(address);

  const metadata = await fetchMetadata(connection, callOptionAccount.mint);

  return new CallOption(
    callOptionAccount as CallOptionData,
    metadata,
    address
  ).pretty();
}

export async function waitForCallOption(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<CallOptionPretty> {
  async function tryFetchCallOption(retry: number): Promise<CallOptionPretty> {
    await utils.wait(800);

    if (retry > 3) {
      throw new Error("Max retries");
    }

    try {
      const callOption = await fetchCallOption(connection, address);
      return callOption;
    } catch {
      return tryFetchCallOption(retry + 1);
    }
  }

  return tryFetchCallOption(0);
}

export async function fetchMultipleCallOptions(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<CallOptionPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const callOptions = await program.account.callOption.all(filter);

  const metadataAccounts = await fetchMetadataAccounts(connection, callOptions);

  const combinedAccounts = callOptions.map((callOption, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new CallOption(
        callOption.account as CallOptionData,
        metadataAccount,
        callOption.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as CallOptionPretty[];
}

export async function fetchMultipleCallOptionBids(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<CallOptionBidPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const callOptionBids = await program.account.callOptionBid.all(filter);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    callOptionBids
  );

  const combinedAccounts = callOptionBids.map((bid, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new CallOptionBid(
        bid.account as CallOptionBidData,
        metadataAccount,
        bid.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as CallOptionBidPretty[];
}
