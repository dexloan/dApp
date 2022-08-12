import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import * as query from "../../common/query";
import { SECONDS_PER_DAY } from "../../common/constants";
import { HireStateEnum, NFTResult } from "../../common/types";
import { HirePretty } from "../../common/model";
import {
  getHireCacheKey,
  getHiresCacheKey,
  getHiresGivenCacheKey,
  getHiresTakenCacheKey,
} from "../query/hire";

interface InitHireMutationVariables {
  mint: anchor.web3.PublicKey;
  options: {
    amount: number;
    expiry: number;
    borrower?: anchor.web3.PublicKey;
  };
}

export const useInitHireMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: InitHireMutationVariables) => {
      if (anchorWallet) {
        return actions.initHire(
          connection,
          anchorWallet,
          variables.mint,
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
        queryClient.setQueryData<NFTResult[]>(
          ["wallet-nfts", anchorWallet?.publicKey.toBase58()],
          (data) => {
            if (!data) {
              return [];
            }
            return data.filter(
              (item: NFTResult) =>
                !item?.tokenAccount.data.mint.equals(variables.mint)
            );
          }
        );

        toast.success("Rental listing created");

        onSuccess();
      },
    }
  );
};

interface TakeHireVariables {
  mint: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
  metadata: Metadata;
  days: number;
}

export const useTakeHireMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, TakeHireVariables>(
    async ({ mint, lender, metadata, days }) => {
      if (anchorWallet && wallet.publicKey) {
        const hireTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.takeHire(
          connection,
          anchorWallet,
          mint,
          lender,
          hireTokenAccount,
          metadata,
          days
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const hireAddress = await query.findHireAddress(
          variables.mint,
          variables.lender
        );

        queryClient.setQueryData<HirePretty[] | undefined>(
          getHiresCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getHiresTakenCacheKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<HirePretty | undefined>(
          getHireCacheKey(hireAddress),
          (item) => {
            if (item && anchorWallet) {
              return {
                ...item,
                data: {
                  ...item.data,
                  state: HireStateEnum.Hired,
                  borrower: anchorWallet.publicKey.toBase58(),
                  currentStart: Date.now() / 1000,
                  currentExpiry:
                    Date.now() / 1000 +
                    SECONDS_PER_DAY.toNumber() * variables.days,
                },
              };
            }
          }
        );

        toast.success("NFT rented");

        onSuccess();
      },
      onError(err) {
        console.error(err);
        // @ts-ignore
        console.log(err.logs);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

interface ExtendHireVariables {
  mint: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
  metadata: Metadata;
  days: number;
}

export const useExtendHireMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ExtendHireVariables>(
    async ({ mint, lender, metadata, days }) => {
      if (anchorWallet && wallet.publicKey) {
        return actions.extendHire(
          connection,
          anchorWallet,
          mint,
          lender,
          metadata,
          days
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const hireAddress = await query.findHireAddress(
          variables.mint,
          variables.lender
        );

        queryClient.invalidateQueries(
          getHiresTakenCacheKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<HirePretty | undefined>(
          getHireCacheKey(hireAddress),
          (item) => {
            if (item && anchorWallet) {
              return {
                ...item,
                data: {
                  ...item.data,
                  currentExpiry:
                    (item.data.currentExpiry ?? Date.now() / 1000) +
                    SECONDS_PER_DAY.toNumber() * variables.days,
                },
              };
            }
          }
        );

        toast.success("NFT hired");

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

interface RecoverHireMutation {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useRecoverHireMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RecoverHireMutation>(
    async ({ mint, borrower }) => {
      if (anchorWallet) {
        const depositTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.recoverHire(
          connection,
          anchorWallet,
          mint,
          borrower,
          depositTokenAccount
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
        toast.success("Your NFT has been returned to you.");

        queryClient.setQueryData(
          getHiresGivenCacheKey(anchorWallet?.publicKey),
          (items: HirePretty[] | undefined) => {
            if (!items) return [];

            return items.filter(
              (item) => item.data.mint !== variables.mint.toBase58()
            );
          }
        );

        const loanAddress = await query.findHireAddress(
          variables.mint,
          variables.borrower
        );

        setHireState(queryClient, loanAddress, HireStateEnum.Listed);

        onSuccess();
      },
    }
  );
};

interface WithdrawFromHireEscrowMutation {
  mint: anchor.web3.PublicKey;
}

export function useWithdrawFromHireEscrowMutation() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, WithdrawFromHireEscrowMutation>(
    async ({ mint }) => {
      if (anchorWallet) {
        return actions.withdrawFromHireEscrow(connection, anchorWallet, mint);
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
        toast.success("Withdrawl made.");

        if (anchorWallet) {
          const hireAddress = await query.findHireAddress(
            variables.mint,
            anchorWallet.publicKey
          );

          await queryClient.invalidateQueries(getHireCacheKey(hireAddress));
        }
      },
    }
  );
}

function setHireState(
  queryClient: QueryClient,
  hireAddress: anchor.web3.PublicKey,
  state: HireStateEnum
) {
  queryClient.setQueryData<HirePretty | undefined>(
    getHireCacheKey(hireAddress),
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
