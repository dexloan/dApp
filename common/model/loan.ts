import { BN, web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";

import type { LoanData } from "../types";
import * as utils from "../utils";
import { AnchorWallet } from "@solana/wallet-adapter-react";

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
    return this.data.startDate.add(this.data.duration);
  }

  public isLender(wallet: AnchorWallet) {
    return this.data.lender.toBase58() === wallet.publicKey.toBase58();
  }

  public isBorrower(wallet: AnchorWallet) {
    return this.data.borrower.toBase58() === wallet.publicKey.toBase58();
  }

  get amount() {
    return utils.formatAmount(this.data.amount);
  }

  get duration() {
    return utils.formatDuration(this.data.duration);
  }

  get expired() {
    return Date.now() / 1000 > this.expiry().toNumber();
  }

  get dueDateAndTime() {
    return utils.formatDueDate(this.data.startDate, this.data.duration, true);
  }

  get dueDate() {
    return utils.formatDueDate(this.data.startDate, this.data.duration, false);
  }

  get proRataInterestRate() {
    return utils.calculateProRataInterestRate(
      this.data.basisPoints,
      this.data.duration
    );
  }

  get interestDue() {
    return utils.formatInterestDue(
      this.data.amount,
      this.data.startDate,
      this.data.basisPoints
    );
  }

  get totalDue() {
    return utils.formatTotalDue(
      this.data.amount,
      this.data.startDate,
      this.data.basisPoints
    );
  }

  get amountOnMaturity() {
    return utils.formatAmountOnMaturity(
      this.data.amount,
      this.data.duration,
      this.data.basisPoints
    );
  }

  pretty() {
    return {
      data: {
        state: this.data.state,
        amount: this.data.amount.toNumber(),
        borrower: this.data.borrower.toBase58(),
        lender: this.data.lender.toBase58(),
        basisPoints: this.data.basisPoints,
        duration: this.data.duration.toNumber(),
        startDate: this.data.startDate.toNumber(),
        escrow: this.data.escrow.toBase58(),
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
        escrowBump: this.data.escrowBump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: LoanPretty) {
    return new Loan(
      {
        state: args.data.state,
        amount: new BN(args.data.amount),
        borrower: new web3.PublicKey(args.data.borrower),
        lender: new web3.PublicKey(args.data.lender),
        basisPoints: args.data.basisPoints,
        duration: new BN(args.data.duration),
        startDate: new BN(args.data.startDate),
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
