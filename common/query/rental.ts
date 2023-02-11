import * as anchor from "@project-serum/anchor";

import * as utils from "../utils";
import { RentalData } from "../types";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";
import { Rental, RentalPretty } from "../model/rental";

export async function findRentalAddress(
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [hireAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("rental"), mint.toBuffer(), lender.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return hireAddress;
}

export async function findRentalEscrowAddress(
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [rentalEscrowAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("hire_escrow"), mint.toBuffer(), lender.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return rentalEscrowAddress;
}

export async function fetchRental(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<RentalPretty> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hireAccount = await program.account.rental.fetch(address);

  const metadata = await fetchMetadata(connection, hireAccount.mint);

  if (metadata === null) {
    throw new Error("metadata account not found");
  }

  return new Rental(hireAccount as RentalData, metadata, address).pretty();
}

export async function waitForRental(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<RentalPretty> {
  async function tryFetchRental(retry: number): Promise<RentalPretty> {
    await utils.wait(800);

    if (retry > 3) {
      throw new Error("Max retries");
    }

    try {
      const rental = await fetchRental(connection, address);
      return rental;
    } catch {
      return tryFetchRental(retry + 1);
    }
  }

  return tryFetchRental(0);
}

export async function fetchMultipleRentals(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<RentalPretty[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const hires = await program.account.rental.all(filter);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    hires.map((h) => h.account.mint)
  );

  const combinedAccounts = hires.map((rental, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return new Rental(
        rental.account as RentalData,
        metadataAccount,
        rental.publicKey
      ).pretty();
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as RentalPretty[];
}
