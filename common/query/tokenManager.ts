import * as anchor from "@project-serum/anchor";

import { LISTINGS_PROGRAM_ID } from "../constants";
import { Loan, LoanPretty } from "../model";
import { getProgram, getProvider } from "../provider";
import {
  fetchMetadata,
  fetchMetadataAccounts,
  assertMintIsWhitelisted,
} from "./common";

export async function findTokenManagerAddress(
  mint: anchor.web3.PublicKey,
  issuer: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [tokenManagerAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("token_manager"), mint.toBuffer(), issuer.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return tokenManagerAddress;
}

export async function fetchTokenManager(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey,
  issuer: anchor.web3.PublicKey
) {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const address = await findTokenManagerAddress(mint, issuer);

  return program.account.tokenManager.fetch(address);
}
