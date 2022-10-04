import type { NextApiRequest, NextApiResponse } from "next";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import nacl from "tweetnacl";
import naclutil from "tweetnacl-util";
import nookies from "nookies";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { publicKey, signature } = JSON.parse(req.body);

  const signatureBytes = base58.decode(signature);
  const messageBytes = naclutil.decodeUTF8(
    process.env.NEXT_PUBLIC_AUTH_MESSAGE as string
  );

  const result = nacl.sign.detached.verify(
    messageBytes,
    signatureBytes,
    new PublicKey(publicKey).toBuffer()
  );

  if (result) {
    const payload = { publicKey };
    const token = await jwt.sign(
      payload,
      process.env.AUTH_TOKEN_SECRET as string
    );
    nookies.set({ res }, "auth", token, {
      httpOnly: true,
      secure: true,
      SameSite: "Strict",
    });

    return res.status(200).json({ message: "OK" });
  }

  return res.status(403).json({ message: "Failed to authenticate" });
}
