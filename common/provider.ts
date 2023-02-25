import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { OndaListings, IDL } from "./idl";
import { LISTINGS_PROGRAM_ID } from "./constants";

export function getProgram(
  provider: anchor.AnchorProvider
): anchor.Program<OndaListings> {
  return new anchor.Program<OndaListings>(IDL, LISTINGS_PROGRAM_ID, provider);
}

export function getProvider(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
): anchor.AnchorProvider {
  wallet = wallet || new MockWallet(anchor.web3.Keypair.generate());

  return new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });
}

class MockWallet implements anchor.Wallet {
  constructor(readonly payer: anchor.web3.Keypair) {}

  async signTransaction(
    tx: anchor.web3.Transaction
  ): Promise<anchor.web3.Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(
    txs: anchor.web3.Transaction[]
  ): Promise<anchor.web3.Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): anchor.web3.PublicKey {
    return this.payer.publicKey;
  }
}
