import * as anchor from "@project-serum/anchor";

import * as utils from "../utils";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { CallOptionData, CallOptionBidData } from "../types";
import { DexloanListings } from "../idl";

export async function findCallOptionAddress(
  mint: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [callOptionAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("call_option"), mint.toBuffer(), seller.toBuffer()],
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
