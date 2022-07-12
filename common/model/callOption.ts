import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import dayjs from "dayjs";

import type { CallOptionData } from "../types";
import * as utils from "../utils";

export type CallOptionArgs = {
  data: CallOptionData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type CallOptionPretty = ReturnType<CallOption["pretty"]>;

export class CallOption implements CallOptionArgs {
  constructor(
    public readonly data: CallOptionData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  get address() {
    return this.publicKey.toBase58();
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("DD/MM/YYYY");
  }

  get expired() {
    return Date.now() / 1000 > this.data.expiry.toNumber();
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

  pretty() {
    return {
      data: {
        state: this.data.state,
        amount: this.data.amount.toNumber(),
        seller: this.data.seller.toBase58(),
        buyer: this.data.buyer?.toBase58(),
        expiry: this.data.expiry.toNumber(),
        strikePrice: this.data.strikePrice.toNumber(),
        escrow: this.data.escrow.toBase58(),
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
        escrowBump: this.data.escrowBump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: CallOptionPretty) {
    return new CallOption(
      {
        state: args.data.state,
        amount: new BN(args.data.amount),
        seller: new web3.PublicKey(args.data.seller),
        buyer: new web3.PublicKey(args.data.buyer),
        expiry: new BN(args.data.expiry),
        strikePrice: new BN(args.data.strikePrice),
        escrow: new web3.PublicKey(args.data.escrow),
        mint: new web3.PublicKey(args.data.mint),
        bump: args.data.bump,
        escrowBump: args.data.escrowBump,
      },
      Metadata.fromArgs({
        key: 0 as Key, // TODO
        updateAuthority: new web3.PublicKey(args.metadata.updateAuthority),
        mint: new web3.PublicKey(args.metadata.mint),
        data: args.metadata.data,
        primarySaleHappened: args.metadata.primarySaleHappened,
        isMutable: args.metadata.isMutable,
        editionNonce: args.metadata.editionNonce,
        tokenStandard: args.metadata.tokenStandard,
        collection: args.metadata.collection,
        uses: args.metadata.uses,
      }),
      new web3.PublicKey(args.publicKey)
    );
  }
}
