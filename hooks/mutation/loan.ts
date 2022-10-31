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
import { NftResult, LoanStateEnum } from "../../common/types";
import { LoanOfferPretty, LoanPretty, LoanOffer } from "../../common/model";
import {
  getLoansTakenCacheKey,
  getLoanCacheKey,
  getLoansQueryKey,
  getLoansGivenCacheKey,
  getNftByOwnerCacheKey,
  getLoanOffersCacheKey,
} from "../query";
import { SerializedLoanState } from "../../common/constants";

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
        queryClient.setQueryData<NftResult[]>(
          getNftByOwnerCacheKey(anchorWallet?.publicKey),
          (data) => {
            if (!data) {
              return [];
            }
            return data.filter(
              (item: NftResult) =>
                !item?.tokenAccount.mint.equals(variables.mint)
            );
          }
        );

        if (anchorWallet) {
          const loanAddress = await query.findLoanAddress(
            variables.mint,
            anchorWallet.publicKey
          );

          try {
            const loan = await query.waitForLoan(connection, loanAddress);

            await queryClient.setQueryData(getLoanCacheKey(loanAddress), loan);
          } catch {}
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
    amount: number;
    basisPoints: number;
    duration: number;
  };
  ids: number[];
}

export const useOfferLoanMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: OfferLoanMutationVariables) => {
      if (anchorWallet) {
        return actions.offerLoan(
          connection,
          anchorWallet,
          variables.collection,
          variables.collectionMint,
          variables.options,
          variables.ids
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
          queryClient.invalidateQueries(getLoanOffersCacheKey());
        }

        toast.success("Listing created");

        onSuccess();
      },
    }
  );
};

interface TakeLoanVariables {
  mint: anchor.web3.PublicKey;
  offer: LoanOffer;
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
      async onSuccess(_, variables) {
        queryClient.setQueryData<LoanOfferPretty[] | undefined>(
          getLoanOffersCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.publicKey !== variables.offer.publicKey.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getLoansTakenCacheKey(anchorWallet?.publicKey)
        );

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

  return useMutation<void, Error, LoanOffer>(
    async (variables) => {
      if (anchorWallet) {
        return actions.closeOffer(connection, anchorWallet, variables);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        queryClient.setQueryData<LoanOfferPretty[] | undefined>(
          getLoanOffersCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.publicKey !== variables.publicKey.toBase58()
              );
            }
          }
        );

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
          getLoansQueryKey(SerializedLoanState.Listed),
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
          getLoanCacheKey(loanAddress),
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
          getLoansQueryKey(SerializedLoanState.Listed),
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

        setTimeout(
          () =>
            queryClient.invalidateQueries(
              getLoansGivenCacheKey(anchorWallet?.publicKey)
            ),
          500
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
  lender: anchor.web3.PublicKey | null;
}

export const useRepayLoanMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepayLoanProps>(
    async ({ mint, lender }) => {
      if (anchorWallet && lender) {
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
        toast.success("Loan repaid. Your NFT has been unlocked.");

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
    getLoanCacheKey(loan),
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
