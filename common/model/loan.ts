import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import * as utils from "../utils";
import { LoanData, LoanStateEnum } from "../types";

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

  get amount() {
    if (this.data.amount) {
      return utils.formatAmount(this.data.amount);
    }
  }

  get apy() {
    return this.data.basisPoints / 100 + "%";
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
          this.data.basisPoints
        )
      );
    }
  }

  get totalDue() {
    if (this.data.amount && this.data.startDate) {
      return utils.formatTotalDue(
        this.data.amount,
        this.data.startDate,
        this.data.basisPoints
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
        outstanding: this.data.outstanding.toNumber(),
        threshold: this.data.threshold,
        borrower: this.data.borrower.toBase58(),
        lender: this.data.lender?.toBase58(),
        installments: this.data.installments,
        currentInstallment: this.data.currentInstallment,
        basisPoints: this.data.basisPoints,
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
        outstanding: new BN(args.data.outstanding),
        threshold: null,
        borrower: new web3.PublicKey(args.data.borrower),
        lender: args.data.lender ? new web3.PublicKey(args.data.lender) : null,
        installments: args.data.installments,
        currentInstallment: args.data.currentInstallment,
        basisPoints: args.data.basisPoints,
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
        uses: args.metadata.uses,
      }),
      new web3.PublicKey(args.publicKey)
    );
  }
}
