import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

import { BACKEND_RPC_ENDPOINT } from "../../common/constants";

interface TransactionResponse {
  signature: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionResponse>
) {
  const connection = new web3.Connection(BACKEND_RPC_ENDPOINT);
  const serializedTransaction = JSON.parse(req.body).transaction as string;
  const buffer = Buffer.from(serializedTransaction, "base64");
  const transaction = web3.Transaction.from(buffer);

  try {
    console.log("transaction: ", transaction);
    const signer = await getSigner();
    console.log("signer: ", signer.publicKey.toBase58());
    transaction.partialSign(signer);

    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "confirmed",
      }
    );

    return res.status(200).json({ signature });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getSigner() {
  const path = "m/44'/501'/0'/0'";
  const mnemomic = process.env.SIGNER_SEED_PHRASE as string;
  const seed = await bip39.mnemonicToSeed(mnemomic);
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  const keypair = web3.Keypair.fromSeed(derivedSeed);
  return keypair;
}
