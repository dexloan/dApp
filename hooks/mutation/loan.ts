import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import { NFTResult, LoanResult } from "../../common/types";
import { LoanState } from "../../common/constants";
import { loan, getOrCreateTokenAccount } from "../../common/actions";
import {
  getBorrowingsQueryKey,
  getLoanQueryKey,
  getLoansQueryKey,
  getPersonalLoansQueryKey,
} from "../query/loan";
import { findLoanAddress } from "../../common/query/loan";

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
        return loan.initLoan(
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

interface GiveLoanMutationProps {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useGiveLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, GiveLoanMutationProps>(
    async ({ mint, borrower }) => {
      if (anchorWallet) {
        return loan.giveLoan(connection, anchorWallet, mint, borrower);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const loanAddress = await findLoanAddress(
          variables.mint,
          variables.borrower
        );

        queryClient.setQueryData<LoanResult[] | undefined>(
          getLoansQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getPersonalLoansQueryKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<LoanResult | undefined>(
          getLoanQueryKey(loanAddress),
          (item) => {
            if (item) {
              return {
                ...item,
                listing: {
                  ...item.data,
                  state: LoanState.Active,
                  startDate: new anchor.BN(Date.now() / 1000),
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

interface CloseMutationVariables {
  mint: anchor.web3.PublicKey;
}

export const useCloseLoanMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseMutationVariables>(
    async ({ mint }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return loan.closeLoan(
          connection,
          anchorWallet,
          mint,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onSuccess(_, variables) {
        queryClient.setQueryData<LoanResult[] | undefined>(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<LoanResult[] | undefined>(
          getLoansQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

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

interface RepossessMutationProps {
  mint: anchor.web3.PublicKey;
}

export const useRepossessMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepossessMutationProps>(
    async ({ mint }) => {
      if (anchorWallet && wallet.publicKey) {
        const lenderTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return loan.repossessCollateral(
          connection,
          anchorWallet,
          mint,
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
      onSuccess(_, variables) {
        toast.success("NFT repossessed.");

        queryClient.setQueryData(
          getPersonalLoansQueryKey(anchorWallet?.publicKey),
          (loans: LoanResult[] | undefined) => {
            if (!loans) return [];

            return loans.filter(
              (loan) => loan.data.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setLoanState(queryClient, variables.mint, LoanState.Defaulted);

        onSuccess();
      },
    }
  );
};

interface RepaymentMutationProps extends RepossessMutationProps {
  lender: anchor.web3.PublicKey;
}

export const useRepaymentMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepaymentMutationProps>(
    async ({ mint, lender }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return loan.repayLoan(
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
      onSuccess(_, variables) {
        toast.success("Loan repaid. Your NFT has been returned to you.");

        queryClient.setQueryData(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (borrowings: LoanResult[] | undefined) => {
            if (!borrowings) return [];

            return borrowings.filter(
              (borrowing) =>
                borrowing.data.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setLoanState(queryClient, variables.mint, LoanState.Repaid);

        onSuccess();
      },
    }
  );
};

function setLoanState(
  queryClient: QueryClient,
  loan: anchor.web3.PublicKey,
  state: typeof LoanState[keyof typeof LoanState]
) {
  queryClient.setQueryData<LoanResult | undefined>(
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
