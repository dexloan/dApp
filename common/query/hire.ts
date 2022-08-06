import * as anchor from "@project-serum/anchor";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";
import { Hire, HirePretty } from "../model/hire";

export async function findHireAddress(
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [callOptionAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("hire"), mint.toBuffer(), lender.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return callOptionAccount;
}

export async function fetchHire(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<HirePretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hireAccount = await program.account.hire.fetch(address);

  assertMintIsWhitelisted(hireAccount.mint);

  const metadata = await fetchMetadata(connection, hireAccount.mint);

  return new Hire(hireAccount, metadata, address).pretty();
}

export async function fetchMultipleHires(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<HirePretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hires = await program.account.hire
    .all(filter)
    .then((result) =>
      result.sort(
        (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
      )
    );

  const metadataAccounts = await fetchMetadataAccounts(connection, hires);

  const combinedAccounts = hires.map((hire, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new Hire(hire.account, metadataAccount, hire.publicKey).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as HirePretty[];
}
