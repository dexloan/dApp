import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import * as query from "../../common/query";
import { NFTResult, LoanStateEnum } from "../../common/types";
import { LoanPretty } from "../../common/model";
import {
  getLoansTakenCacheKey,
  getLoanQueryKey,
  getLoansQueryKey,
  getLoansGivenCacheKey,
} from "../query/loan";

interface InitLoanMutationVariables {
  mint: anchor.web3.PublicKey;
  depositTokenAccount: anchor.web3.PublicKey;
  options: {
    amount: number;
    basisPoints: number;
    duration: number;
  };
}

export const useInitLoanMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: InitLoanMutationVariables) => {
      if (anchorWallet) {
        return actions.initLoan(
          connection,
          anchorWallet,
          variables.mint,
          variables.depositTokenAccount,
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
      onSuccess(_, variables) {
        queryClient.setQueryData<NFTResult[]>(
          ["wallet-nfts", anchorWallet?.publicKey.toBase58()],
          (data) => {
            if (!data) {
              return [];
            }
            return data.filter(
              (item: NFTResult) =>
                item?.tokenAccount.pubkey !== variables.depositTokenAccount
            );
          }
        );

        toast.success("Listing created");

        onSuccess();
      },
    }
  );
};

interface GiveLoanVariables {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useGiveLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, GiveLoanVariables>(
    async ({ mint, borrower }) => {
      if (anchorWallet) {
        return actions.giveLoan(connection, anchorWallet, mint, borrower);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        queryClient.setQueryData<LoanPretty[] | undefined>(
          getLoansQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getLoansGivenCacheKey(anchorWallet?.publicKey)
        );

        const loanAddress = await query.findLoanAddress(
          variables.mint,
          variables.borrower
        );

        queryClient.setQueryData<LoanPretty | undefined>(
          getLoanQueryKey(loanAddress),
          (item) => {
            if (item) {
              return {
                ...item,
                data: {
                  ...item.data,
                  state: LoanStateEnum.Active,
                  startDate: new anchor.BN(Date.now() / 1000).toNumber(),
                },
              };
            }
          }
        );

        toast.success("Loan created");

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

interface CloseLoanVariables {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useCloseLoanMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseLoanVariables>(
    async ({ mint }) => {
      if (anchorWallet) {
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
        queryClient.setQueryData<LoanPretty[] | undefined>(
          getLoansTakenCacheKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<LoanPretty[] | undefined>(
          getLoansQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        const loanAddress = await query.findLoanAddress(
          variables.mint,
          variables.borrower
        );

        setLoanState(queryClient, loanAddress, LoanStateEnum.Cancelled);

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

interface RepossessProps {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useRepossessMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepossessProps>(
    async ({ mint, borrower }) => {
      if (anchorWallet && wallet.publicKey) {
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
        toast.success("NFT repossessed.");

        queryClient.setQueryData(
          getLoansGivenCacheKey(anchorWallet?.publicKey),
          (loans: LoanPretty[] | undefined) => {
            if (!loans) return [];

            return loans.filter(
              (loan) => loan.data.mint !== variables.mint.toBase58()
            );
          }
        );

        queryClient.invalidateQueries(
          getLoansGivenCacheKey(anchorWallet?.publicKey)
        );

        const loanAddress = await query.findLoanAddress(
          variables.mint,
          variables.borrower
        );

        setLoanState(queryClient, loanAddress, LoanStateEnum.Defaulted);

        onSuccess();
      },
    }
  );
};

interface RepayLoanProps {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
}

export const useRepayLoanMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepayLoanProps>(
    async ({ mint, lender }) => {
      if (anchorWallet) {
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
        toast.success("Loan repaid. Your NFT has been returned to you.");

        queryClient.setQueryData(
          getLoansTakenCacheKey(anchorWallet?.publicKey),
          (borrowings: LoanPretty[] | undefined) => {
            if (!borrowings) return [];

            return borrowings.filter(
              (borrowing) => borrowing.data.mint !== variables.mint.toBase58()
            );
          }
        );

        const loanAddress = await query.findLoanAddress(
          variables.mint,
          variables.borrower
        );

        setLoanState(queryClient, loanAddress, LoanStateEnum.Repaid);

        onSuccess();
      },
    }
  );
};

function setLoanState(
  queryClient: QueryClient,
  loan: anchor.web3.PublicKey,
  state: LoanStateEnum
) {
  queryClient.setQueryData<LoanPretty | undefined>(
    getLoanQueryKey(loan),
    (item) => {
      if (item) {
        return {
          ...item,
          data: {
            ...item.data,
            state,
          },
        };
      }
    }
  );
}
