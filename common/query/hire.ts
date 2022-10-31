import * as anchor from "@project-serum/anchor";

import * as utils from "../utils";
import { HireData } from "../types";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";
import { Hire, HirePretty } from "../model/hire";

export async function findHireAddress(
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [hireAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("hire"), mint.toBuffer(), lender.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return hireAddress;
}

export async function findHireEscrowAddress(
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [hireEscrowAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("hire_escrow"), mint.toBuffer(), lender.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return hireEscrowAddress;
}

export async function fetchHire(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<HirePretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hireAccount = await program.account.hire.fetch(address);

  const metadata = await fetchMetadata(connection, hireAccount.mint);

  return new Hire(hireAccount as HireData, metadata, address).pretty();
}

export async function waitForHire(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<HirePretty> {
  async function tryFetchHire(retry: number): Promise<HirePretty> {
    await utils.wait(800);

    if (retry > 3) {
      throw new Error("Max retries");
    }

    try {
      const hire = await fetchHire(connection, address);
      return hire;
    } catch {
      return tryFetchHire(retry + 1);
    }
  }

  return tryFetchHire(0);
}

export async function fetchMultipleHires(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<HirePretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hires = await program.account.hire.all(filter);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    hires.map((h) => h.account.mint)
  );

  const combinedAccounts = hires.map((hire, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new Hire(
        hire.account as HireData,
        metadataAccount,
        hire.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as HirePretty[];
}
