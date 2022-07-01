import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import dayjs from "dayjs";

import type { CallOptionAccount } from "./types";
import * as utils from "../utils";

export type CallOptionArgs = {
  data: CallOptionAccount;
  metadata: Metadata;
  publicKey: anchor.web3.PublicKey;
};

export class CallOption {
  constructor(
    public readonly data: CallOptionAccount,
    public readonly metadata: Metadata,
    public readonly publicKey: anchor.web3.PublicKey
  ) {}

  get address() {
    return this.publicKey.toBase58();
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("DD/MM/YYYY");
  }

  get cost() {
    return utils.formatAmount(this.data.amount);
  }

  get strikePrice() {
    return utils.formatAmount(this.data.strikePrice);
  }

  get buyer() {
    return this.data.buyer ? this.data.buyer.toBase58() : "";
  }

  get seller() {
    return this.data.seller ? this.data.seller.toBase58() : "";
  }
}
