import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import * as utils from "../utils";
import dayjs from "../../common/lib/dayjs";
import type { HireData, HireStateEnum } from "../types";

const SECONDS_PER_DAY = new BN(86_400);

export type HireArgs = {
  data: HireData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type HirePretty = ReturnType<Hire["pretty"]>;

export class Hire implements HireArgs {
  constructor(
    public readonly data: HireData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  public isBorrower(wallet?: AnchorWallet) {
    if (wallet && this.data.borrower) {
      return this.data.borrower.equals(wallet.publicKey);
    }
    return false;
  }

  public isLender(wallet?: AnchorWallet) {
    if (wallet) {
      return this.data.lender.equals(wallet.publicKey);
    }
    return false;
  }

  public getFullAmount(days: number) {
    return utils.formatAmount(this.data.amount.mul(new BN(days)));
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get amount() {
    return utils.formatAmount(this.data.amount);
  }

  get currentExpiry() {
    return this.data.currentExpiry
      ? dayjs.unix(this.data.currentExpiry.toNumber()).format("DD/MM/YYYY")
      : null;
  }

  get currentExpiryLongFormat() {
    if (this.data.currentExpiry) {
      const date = dayjs.unix(this.data.currentExpiry.toNumber());
      return date.format("MMM D, YYYY") + " at " + date.format("h:mm A z");
    }
    return null;
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("DD/MM/YYYY");
  }

  get expiryLongFormat() {
    const date = dayjs.unix(this.data.expiry.toNumber());
    return date.format("MMM D, YYYY");
  }

  get expired() {
    return Date.now() / 1000 > this.data.expiry.toNumber();
  }

  get borrower() {
    return this.data.borrower ? this.data.borrower.toBase58() : "";
  }

  get lender() {
    return this.data.lender ? this.data.lender.toBase58() : "";
  }

  get state(): HireStateEnum | undefined {
    if (typeof this.data.state === "object" && this.data.state !== null) {
      return Object.keys(this.data.state)[0] as HireStateEnum;
    }
  }

  get maxDays(): number {
    const ts = Date.now() / 1000;
    return Math.floor(
      this.data.expiry.sub(new BN(ts)).div(SECONDS_PER_DAY).toNumber()
    );
  }

  pretty() {
    return {
      data: {
        state: this.state,
        amount: this.data.amount.toNumber(),
        lender: this.data.lender.toBase58(),
        borrower: this.data.borrower?.toBase58(),
        expiry: this.data.expiry.toNumber(),
        currentExpiry: this.data.currentExpiry?.toNumber(),
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: HirePretty) {
    return new Hire(
      {
        state: { [args.data.state as string]: {} },
        amount: new BN(args.data.amount),
        lender: new web3.PublicKey(args.data.lender),
        borrower: args.data.borrower
          ? new web3.PublicKey(args.data.borrower)
          : null,
        expiry: new BN(args.data.expiry),
        currentExpiry: args.data.currentExpiry
          ? new BN(args.data.currentExpiry)
          : null,
        mint: new web3.PublicKey(args.data.mint),
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
