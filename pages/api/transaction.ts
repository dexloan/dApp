import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import nookies from "nookies";
import jwt from "jsonwebtoken";

import { BACKEND_RPC_ENDPOINT } from "../../common/constants";
import { getProgram, getProvider } from "../../common/provider";

const client = new Redis({
  url: process.env.REDIS_URL as string,
  token: process.env.REDIS_TOKEN as string,
});

const ratelimit = new Ratelimit({
  redis: client,
  limiter: Ratelimit.fixedWindow(5, "5 s"),
});

interface TransactionResponse {
  signature?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionResponse>
) {
  const identifier = getClientIp(req);

  if (identifier) {
    const result = await ratelimit.limit(identifier as string);
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
  } else {
    return res.status(429).end();
  }

  const cookies = nookies.get({ req });
  const token = cookies.auth;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const connection = new web3.Connection(BACKEND_RPC_ENDPOINT);
  const { info, transaction: serializedTransaction } = JSON.parse(req.body) as {
    transaction: string;
    info: { struct: "callOption" | "hire" | "loan"; address: string };
  };
  const buffer = Buffer.from(serializedTransaction, "base64");
  const transaction = web3.Transaction.from(buffer);

  const accounts = transaction.instructions[0].keys;
  const payload = jwt.verify(token, process.env.AUTH_TOKEN_SECRET as string);
  // @ts-ignore
  const user = new web3.PublicKey(payload.publicKey);
  const account = new web3.PublicKey(info.address);
  const hasAccount = accounts.some(
    (a) => a.isWritable && a.pubkey.equals(account)
  );

  if (hasAccount) {
    const provider = getProvider(connection);
    const program = getProgram(provider);

    switch (info.struct) {
      case "callOption": {
        try {
          const data = await program.account.callOption.fetch(account);

          if (data.buyer || data.seller) {
            if (
              (data.buyer && user.equals(data.buyer)) ||
              (data.seller && user.equals(data.seller))
            ) {
              // ok
            } else {
              return res.status(401).json({ message: "Not authorized" });
            }
          }
        } catch {}
      }

      case "hire": {
        try {
          const data = await program.account.hire.fetch(account);

          if (data.borrower || data.lender) {
            if (
              (data.borrower && user.equals(data.borrower)) ||
              (data.lender && user.equals(data.lender))
            ) {
              // ok
            } else {
              return res.status(401).json({ message: "Not authorized" });
            }
          }
        } catch {}
      }
      case "loan": {
        try {
          const data = await program.account.loan.fetch(account);

          if (data.borrower || data.lender) {
            if (
              (data.borrower && user.equals(data.borrower)) ||
              (data.lender && user.equals(data.lender))
            ) {
              // ok
            } else {
              return res.status(401).json({ message: "Not authorized" });
            }
          }
        } catch {}
      }
    }
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const signer = await getSigner();
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

function getClientIp(req: NextApiRequest) {
  return req.socket.remoteAddress;
}

async function getSigner() {
  const path = "m/44'/501'/0'/0'";
  const mnemomic = process.env.SIGNER_SEED_PHRASE as string;
  const seed = await bip39.mnemonicToSeed(mnemomic);
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  const keypair = web3.Keypair.fromSeed(derivedSeed);
  return keypair;
}
