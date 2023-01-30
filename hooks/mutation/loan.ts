import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import * as query from "../../common/query";
import { LoanJson, LoanOfferJson, NftResult } from "../../common/types";
import { getNftByOwnerCacheKey, fetchLoanOffers } from "../query";
import { wait } from "../../common/utils";
import { findLoanAddress } from "../../common/query";

export interface AskLoanMutationVariables {
  mint: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    amount: number;
    basisPoints: number;
    duration: number;
  };
}

export const useAskLoanMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: AskLoanMutationVariables) => {
      if (anchorWallet) {
        return actions.askLoan(
          connection,
          anchorWallet,
          variables.mint,
          variables.collectionMint,
          variables.options
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error("Error: " + err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      async onSuccess(_, variables) {
        if (anchorWallet) {
          await wait(1000);
          const loanPda = await findLoanAddress(
            variables.mint,
            anchorWallet?.publicKey
          );
          await queryClient.invalidateQueries(["loans"]);
          await queryClient.invalidateQueries(["loan", loanPda.toBase58()]);
        }
        toast.success("Listing created");
        onSuccess();
      },
    }
  );
};

export interface OfferLoanMutationVariables {
  collection: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    count: number;
    amount: number;
    basisPoints: number;
    duration: number;
  };
}

function pickOfferIds(offers: LoanOfferJson[], count: number) {
  const ids = [];
  const existingIds = offers.map((offer) => offer.offerId);

  let id = 0;
  while (ids.length < count && id <= 255) {
    if (!existingIds.includes(id)) {
      ids.push(id);
    }
    id++;
  }

  return ids;
}

export const useOfferLoanMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    async (variables: OfferLoanMutationVariables) => {
      if (anchorWallet) {
        const currentOffers = await fetchLoanOffers({
          lender: anchorWallet.publicKey.toBase58(),
          collections: [variables.collection.toBase58()],
        });
        const ids = pickOfferIds(currentOffers, variables.options.count);
        console.log("current offers: ", currentOffers);
        console.log("next offers: ", ids);

        return actions.offerLoan(
          connection,
          anchorWallet,
          variables.collection,
          variables.collectionMint,
          variables.options,
          ids
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error("Error: " + err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      async onSuccess() {
        await wait(1000);
        await queryClient.invalidateQueries(["loan_offers"]);
        toast.success("Loan offer(s) created");
        onSuccess();
      },
    }
  );
};

interface TakeLoanVariables {
  mint: anchor.web3.PublicKey;
  offer: LoanOfferJson;
}

export const useTakeLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, TakeLoanVariables>(
    async (variables) => {
      if (anchorWallet) {
        return actions.takeLoan(
          connection,
          anchorWallet,
          variables.mint,
          variables.offer
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess() {
        await wait(1000);
        queryClient.invalidateQueries(["loan_offers"]);
        toast.success("Loan taken");
        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

export const useCloseLoanOfferMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanOfferJson>(
    async (variables) => {
      if (anchorWallet) {
        return actions.closeOffer(connection, anchorWallet, variables);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess() {
        queryClient.invalidateQueries(["loan_offers"]);
        toast.success("Offer closed");
        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

export const useGiveLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanJson>(
    async (loan) => {
      if (anchorWallet) {
        const mint = new anchor.web3.PublicKey(loan.mint);
        const borrower = new anchor.web3.PublicKey(loan.borrower);
        return actions.giveLoan(connection, anchorWallet, mint, borrower);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        await wait(1000);
        const mint = new anchor.web3.PublicKey(variables.mint);
        const borrower = new anchor.web3.PublicKey(variables.borrower);
        const loadPda = await query.findLoanAddress(mint, borrower);
        await queryClient.invalidateQueries(["loan", loadPda.toBase58()]);
        await queryClient.invalidateQueries(["loans"]);
        toast.success("Loan given");
        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

export const useCloseLoanMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanJson>(
    async (loan) => {
      if (anchorWallet) {
        const mint = new anchor.web3.PublicKey(loan.mint);

        const borrowerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.closeLoan(
          connection,
          anchorWallet,
          mint,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        await wait(1000);
        const mint = new anchor.web3.PublicKey(variables.mint);
        const borrower = new anchor.web3.PublicKey(variables.borrower);
        const loadPda = await query.findLoanAddress(mint, borrower);
        await queryClient.invalidateQueries(["loan", loadPda.toBase58()]);
        await queryClient.invalidateQueries(["loans"]);
        toast.success("Loan closed");
        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

export const useRepossessMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanJson>(
    async (loan) => {
      if (anchorWallet && wallet.publicKey) {
        const mint = new anchor.web3.PublicKey(loan.mint);
        const borrower = new anchor.web3.PublicKey(loan.borrower);
        const lenderTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.repossessCollateral(
          connection,
          anchorWallet,
          mint,
          borrower,
          lenderTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      async onSuccess(_, variables) {
        const mint = new anchor.web3.PublicKey(variables.mint);
        const borrower = new anchor.web3.PublicKey(variables.borrower);
        const loadPda = await query.findLoanAddress(mint, borrower);
        await queryClient.invalidateQueries(["loan", loadPda.toBase58()]);
        await queryClient.invalidateQueries(["loans"]);
        toast.success("NFT repossessed.");
        onSuccess();
      },
    }
  );
};

export const useRepayLoanMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanJson>(
    async (loan) => {
      if (anchorWallet && loan.lender) {
        const mint = new anchor.web3.PublicKey(loan.mint);
        const lender = new anchor.web3.PublicKey(loan.lender);
        const borrowerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.repayLoan(
          connection,
          anchorWallet,
          mint,
          lender,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      async onSuccess(_, variables) {
        await wait(1000);
        const mint = new anchor.web3.PublicKey(variables.mint);
        const borrower = new anchor.web3.PublicKey(variables.borrower);
        const loadPda = await query.findLoanAddress(mint, borrower);
        await queryClient.invalidateQueries(["loan", loadPda.toBase58()]);
        await queryClient.invalidateQueries(["loans"]);
        toast.success("Loan repaid. Your NFT has been unlocked.");
        onSuccess();
      },
    }
  );
};
