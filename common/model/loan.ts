import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import * as utils from "../utils";
import { LoanData, LoanOfferData, LoanStateEnum } from "../types";

export type LoanArgs = {
  data: LoanData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type LoanPretty = ReturnType<Loan["pretty"]>;

export class Loan implements LoanArgs {
  constructor(
    public readonly data: LoanData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  private expiry() {
    if (this.data.startDate) {
      return this.data.startDate.add(this.data.duration);
    }
  }

  public isLender(wallet: AnchorWallet) {
    if (this.data.lender) {
      return this.data.lender.equals(wallet.publicKey);
    }
    return false;
  }

  public isBorrower(wallet?: AnchorWallet) {
    if (wallet) {
      return this.data.borrower.equals(wallet.publicKey);
    }
    return false;
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get amount() {
    if (this.data.amount) {
      return utils.formatAmount(this.data.amount);
    }
  }

  get apy() {
    return (
      Number(
        this.data.basisPoints / 100 + this.data.creatorBasisPoints / 100
      ).toFixed(2) + "%"
    );
  }

  get creatorApy() {
    return Number(this.data.creatorBasisPoints / 100).toFixed(2) + "%";
  }

  get lenderApy() {
    return Number(this.data.basisPoints / 100).toFixed(2) + "%";
  }

  get duration() {
    return utils.formatDuration(this.data.duration);
  }

  get expired() {
    if (this.data.startDate && this.data.startDate.toNumber() > 0) {
      const expiry = this.expiry();

      if (expiry) {
        return Date.now() / 1000 > expiry.toNumber();
      }
    }
    return false;
  }

  get dueDateAndTime() {
    if (this.data.startDate) {
      return utils.formatDueDate(this.data.startDate, this.data.duration, true);
    }
  }

  get dueDate() {
    if (this.data.startDate) {
      return utils.formatDueDate(
        this.data.startDate,
        this.data.duration,
        false
      );
    }

    return utils.formatDueDate(
      new BN(Date.now() / 1000),
      this.data.duration,
      false
    );
  }

  get proRataInterestRate() {
    return utils.calculateProRataInterestRate(
      this.data.basisPoints,
      this.data.duration
    );
  }

  get interestDue() {
    if (this.data.amount && this.data.startDate) {
      return utils.formatAmount(
        utils.calculateInterestDue(
          this.data.amount,
          this.data.startDate,
          this.data.basisPoints,
          this.expired
        )
      );
    }
  }

  get totalDue() {
    if (this.data.amount && this.data.startDate) {
      return utils.formatTotalDue(
        this.data.amount,
        this.data.startDate,
        this.data.basisPoints,
        this.expired
      );
    }
  }

  get amountOnMaturity() {
    if (this.data.amount) {
      return utils.formatAmountOnMaturity(
        this.data.amount,
        this.data.duration,
        this.data.basisPoints
      );
    }
  }

  get state(): LoanStateEnum | undefined {
    if (typeof this.data.state === "object" && this.data.state !== null) {
      return Object.keys(this.data.state)[0] as LoanStateEnum;
    }
  }

  pretty() {
    return {
      data: {
        state: this.state,
        amount: this.data.amount?.toNumber(),
        basisPoints: this.data.basisPoints,
        creatorBasisPoints: this.data.creatorBasisPoints,
        outstanding: this.data.outstanding.toNumber(),
        threshold: this.data.threshold,
        borrower: this.data.borrower.toBase58(),
        lender: this.data.lender?.toBase58(),
        installments: this.data.installments,
        currentInstallment: this.data.currentInstallment,
        noticeIssued: this.data.noticeIssued?.toNumber(),
        duration: this.data.duration.toNumber(),
        startDate: this.data.startDate?.toNumber(),
        mint: this.data.mint.toBase58(),
        tokenMint: this.data.tokenMint?.toBase58(),
        bump: this.data.bump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: LoanPretty) {
    return new Loan(
      {
        state: { [args.data.state as string]: {} },
        amount: args.data.amount ? new BN(args.data.amount) : null,
        basisPoints: args.data.basisPoints,
        creatorBasisPoints: args.data.creatorBasisPoints,
        outstanding: new BN(args.data.outstanding),
        threshold: null,
        borrower: new web3.PublicKey(args.data.borrower),
        lender: args.data.lender ? new web3.PublicKey(args.data.lender) : null,
        installments: args.data.installments,
        currentInstallment: args.data.currentInstallment,
        noticeIssued: null,
        duration: new BN(args.data.duration),
        startDate: args.data.startDate ? new BN(args.data.startDate) : null,
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
        collectionDetails: args.metadata.collectionDetails,
        uses: args.metadata.uses,
      }),
      new web3.PublicKey(args.publicKey)
    );
  }
}

export type LoanOfferArgs = {
  data: LoanOfferData;
  publicKey: web3.PublicKey;
};

export type LoanOfferPretty = ReturnType<LoanOffer["pretty"]>;

export class LoanOffer implements LoanOfferArgs {
  constructor(
    public readonly data: LoanOfferData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  public isLender(wallet: AnchorWallet) {
    if (this.data.lender) {
      return this.data.lender.equals(wallet.publicKey);
    }
    return false;
  }

  get address() {
    return this.publicKey.toBase58();
  }

  get apy() {
    return this.data.basisPoints / 100 + "%";
  }

  get duration() {
    return utils.formatDuration(this.data.duration);
  }

  get amount() {
    if (this.data.amount) {
      return utils.formatAmount(this.data.amount);
    }
  }

  pretty() {
    return {
      data: {
        id: this.data.id,
        lender: this.data.lender?.toBase58(),
        amount: this.data.amount?.toNumber(),
        basisPoints: this.data.basisPoints,
        duration: this.data.duration.toNumber(),
        collection: this.data.collection.toBase58(),
        ltv: this.data.ltv,
        threshold: this.data.threshold,
        bump: this.data.bump,
        escrowBump: this.data.escrowBump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: LoanOfferPretty) {
    return new LoanOffer(
      {
        id: args.data.id,
        lender: new web3.PublicKey(args.data.lender),
        amount: args.data.amount ? new BN(args.data.amount) : null,
        basisPoints: args.data.basisPoints,
        duration: new BN(args.data.duration),
        collection: new web3.PublicKey(args.data.collection),
        ltv: null,
        threshold: null,
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
