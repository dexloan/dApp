import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import type { RentalData, RentalStateEnum } from "../types";
import * as utils from "../utils";
import { SECONDS_PER_DAY } from "../constants";
import dayjs from "../lib/dayjs";

export type RentalArgs = {
  data: RentalData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type RentalPretty = ReturnType<Rental["pretty"]>;

export class Rental implements RentalArgs {
  constructor(
    public readonly data: RentalData,
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
    // @ts-expect-error
    return utils.formatAmount(this.data.amount.mul(new BN(days)));
  }

  public calculateWithdrawlAmount() {
    if (this.data.currentStart && this.data.currentExpiry) {
      const now = new BN(Date.now() / 1000);
      const start = this.data.currentStart;
      const end = this.data.currentExpiry;
      // TODO do this with BN
      const rate = now.sub(start).toNumber() / end.sub(start).toNumber();
      const amount = this.data.escrowBalance.toNumber() * rate;

      return new BN(amount);
    }
    return new BN(0);
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get amount() {
    // @ts-expect-error
    return utils.formatAmount(this.data.amount);
  }

  get withdrawlAmount() {
    // @ts-expect-error
    return utils.formatAmount(this.calculateWithdrawlAmount());
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

  get fromNow() {
    return dayjs().to(dayjs.unix(this.data.expiry.toNumber()));
  }

  get expiry() {
    return dayjs.unix(this.data.expiry.toNumber()).format("L");
  }

  get expiryLongFormat() {
    const date = dayjs.unix(this.data.expiry.toNumber());
    return date.format("MMM D, YYYY");
  }

  get expired() {
    return Date.now() / 1000 > this.data.expiry.toNumber();
  }

  get currentPeriodExpired() {
    if (this.data.currentExpiry) {
      return Date.now() / 1000 > this.data.currentExpiry.toNumber();
    }
  }

  get borrower() {
    return this.data.borrower ? this.data.borrower.toBase58() : "";
  }

  get lender() {
    return this.data.lender ? this.data.lender.toBase58() : "";
  }

  get state(): RentalStateEnum | undefined {
    if (typeof this.data.state === "object" && this.data.state !== null) {
      return Object.keys(this.data.state)[0] as RentalStateEnum;
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
        creatorBasisPoints: this.data.creatorBasisPoints,
        lender: this.data.lender.toBase58(),
        borrower: this.data.borrower?.toBase58(),
        expiry: this.data.expiry.toNumber(),
        currentStart: this.data.currentStart?.toNumber(),
        currentExpiry: this.data.currentExpiry?.toNumber(),
        escrowBalance: this.data.escrowBalance.toNumber(),
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
        escrowBump: this.data.escrowBump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: RentalPretty) {
    return new Rental(
      {
        state: { [args.data.state as string]: {} },
        amount: new BN(args.data.amount),
        creatorBasisPoints: args.data.creatorBasisPoints,
        lender: new web3.PublicKey(args.data.lender),
        borrower: args.data.borrower
          ? new web3.PublicKey(args.data.borrower)
          : null,
        expiry: new BN(args.data.expiry),
        currentStart: args.data.currentStart
          ? new BN(args.data.currentStart)
          : null,
        currentExpiry: args.data.currentExpiry
          ? new BN(args.data.currentExpiry)
          : null,
        escrowBalance: new BN(args.data.escrowBalance),
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
        collectionDetails: args.metadata.collectionDetails,
        uses: args.metadata.uses,
      }),
      new web3.PublicKey(args.publicKey)
    );
  }
}
