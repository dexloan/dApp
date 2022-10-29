import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import * as utils from "../utils";
import dayjs from "../../common/lib/dayjs";
import type {
  CallOptionData,
  CallOptionBidData,
  CallOptionStateEnum,
} from "../types";

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

  public isBuyer(wallet?: AnchorWallet) {
    if (wallet && this.data.buyer) {
      return this.data.buyer.equals(wallet.publicKey);
    }
    return false;
  }

  public isSeller(wallet?: AnchorWallet) {
    if (wallet) {
      return this.data.seller.equals(wallet.publicKey);
    }
    return false;
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("DD/MM/YYYY");
  }

  get expiryLongFormat() {
    const date = dayjs.unix(this.data.expiry.toNumber()).tz("America/New_York");
    return date.format("MMM D, YYYY") + " at " + date.format("h:mm A z");
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

  get hasBuyer() {
    return this.data.buyer !== null;
  }

  get seller() {
    return this.data.seller ? this.data.seller.toBase58() : "";
  }

  get state(): CallOptionStateEnum | undefined {
    if (typeof this.data.state === "object" && this.data.state !== null) {
      return Object.keys(this.data.state)[0] as CallOptionStateEnum;
    }
  }

  pretty() {
    return {
      data: {
        state: this.state,
        amount: this.data.amount.toNumber(),
        seller: this.data.seller.toBase58(),
        buyer: this.data.buyer?.toBase58(),
        expiry: this.data.expiry.toNumber(),
        strikePrice: this.data.strikePrice.toNumber(),
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: CallOptionPretty) {
    return new CallOption(
      {
        state: { [args.data.state as string]: {} },
        amount: new BN(args.data.amount),
        seller: new web3.PublicKey(args.data.seller),
        buyer: args.data.buyer ? new web3.PublicKey(args.data.buyer) : null,
        expiry: new BN(args.data.expiry),
        strikePrice: new BN(args.data.strikePrice),
        mint: new web3.PublicKey(args.data.mint),
        tokenMint: null,
        bump: args.data.bump,
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

export type CallOptionBidArgs = {
  data: CallOptionBidData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type CallOptionBidPretty = ReturnType<CallOptionBid["pretty"]>;

export class CallOptionBid implements CallOptionBidArgs {
  constructor(
    public readonly data: CallOptionBidData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  public isBuyer(wallet?: AnchorWallet) {
    if (wallet) {
      return wallet.publicKey.equals(this.data.buyer);
    }
    return false;
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("DD/MM/YYYY");
  }

  get expiryLongFormat() {
    const date = dayjs.unix(this.data.expiry.toNumber()).tz("America/New_York");
    return date.format("MMM D, YYYY") + " at " + date.format("h:mm A z");
  }

  get strikePrice() {
    return utils.formatAmount(this.data.strikePrice);
  }

  get cost() {
    return utils.formatAmount(this.data.amount);
  }

  pretty() {
    return {
      data: {
        id: this.data.id,
        buyer: this.data.buyer.toBase58(),
        expiry: this.data.expiry.toNumber(),
        strikePrice: this.data.strikePrice.toNumber(),
        amount: this.data.amount.toNumber(),
        collection: this.data.collection.toBase58(),
        escrowBump: this.data.escrowBump,
        bump: this.data.bump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: CallOptionBidPretty) {
    return new CallOptionBid(
      {
        id: args.data.id,
        buyer: new web3.PublicKey(args.data.buyer),
        expiry: new BN(args.data.expiry),
        strikePrice: new BN(args.data.strikePrice),
        amount: new BN(args.data.amount),
        collection: new web3.PublicKey(args.data.collection),
        escrowBump: args.data.escrowBump,
        bump: args.data.bump,
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
