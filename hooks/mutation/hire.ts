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
import { RentalStateEnum, NftResult } from "../../common/types";
import { RentalPretty } from "../../common/model";
import {
  getRentalCacheKey,
  getRentalsCacheKey,
  getRentalsGivenCacheKey,
  getRentalsTakenCacheKey,
  getNftByOwnerCacheKey,
} from "../query";

export interface InitRentalMutationVariables {
  mint: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    amount: number;
    expiry: number;
    borrower?: anchor.web3.PublicKey;
  };
}

export const useInitRentalMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: InitRentalMutationVariables) => {
      if (anchorWallet) {
        return actions.initRental(
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

            return data.filter((item: NftResult) => {
              return !item?.tokenAccount.mint.equals(variables.mint);
            });
          }
        );

        if (anchorWallet) {
          const hireAddress = await query.findRentalAddress(
            variables.mint,
            anchorWallet.publicKey
          );

          try {
            const rental = await query.waitForRental(connection, hireAddress);

            await queryClient.setQueryData(
              getRentalCacheKey(hireAddress),
              rental
            );
          } catch {}
        }

        toast.success("Rental listing created");

        onSuccess();
      },
    }
  );
};

interface TakeRentalVariables {
  mint: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
  metadata: Metadata;
  days: number;
}

export const useTakeRentalMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, TakeRentalVariables>(
    async ({ mint, lender, metadata, days }) => {
      if (anchorWallet && wallet.publicKey) {
        const hireTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.takeRental(
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
        const hireAddress = await query.findRentalAddress(
          variables.mint,
          variables.lender
        );

        queryClient.setQueryData<RentalPretty[] | undefined>(
          getRentalsCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        setTimeout(
          () =>
            queryClient.invalidateQueries(
              getRentalsTakenCacheKey(anchorWallet?.publicKey)
            ),
          500
        );

        queryClient.setQueryData<RentalPretty | undefined>(
          getRentalCacheKey(hireAddress),
          (item) => {
            if (item && anchorWallet) {
              return {
                ...item,
                data: {
                  ...item.data,
                  state: RentalStateEnum.Rentald,
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

interface ExtendRentalVariables {
  mint: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
  metadata: Metadata;
  days: number;
}

export const useExtendRentalMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ExtendRentalVariables>(
    async ({ mint, lender, metadata, days }) => {
      if (anchorWallet && wallet.publicKey) {
        return actions.extendRental(
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
        const hireAddress = await query.findRentalAddress(
          variables.mint,
          variables.lender
        );

        setTimeout(
          () =>
            queryClient.invalidateQueries(
              getRentalsTakenCacheKey(anchorWallet?.publicKey)
            ),
          500
        );

        queryClient.setQueryData<RentalPretty | undefined>(
          getRentalCacheKey(hireAddress),
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

        toast.success("Rental extension successful");

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

interface RecoverRentalMutation {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

export const useRecoverRentalMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RecoverRentalMutation>(
    async ({ mint, borrower }) => {
      if (anchorWallet) {
        const depositTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.recoverRental(
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
          getRentalsGivenCacheKey(anchorWallet?.publicKey),
          (items: RentalPretty[] | undefined) => {
            if (!items) return [];

            return items.map((item) => {
              if (item.data.mint === variables.mint.toBase58()) {
                return {
                  ...item,
                  state: RentalStateEnum.Listed,
                };
              }

              return item;
            });
          }
        );

        const loanAddress = await query.findRentalAddress(
          variables.mint,
          variables.borrower
        );

        setRentalState(queryClient, loanAddress, RentalStateEnum.Listed);

        onSuccess();
      },
    }
  );
};

interface WithdrawFromRentalEscrowMutation {
  mint: anchor.web3.PublicKey;
}

export function useWithdrawFromRentalEscrowMutation() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, WithdrawFromRentalEscrowMutation>(
    async ({ mint }) => {
      if (anchorWallet) {
        return actions.withdrawFromRentalEscrow(connection, anchorWallet, mint);
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
        toast.success("Withdrawl successful");

        if (anchorWallet) {
          const hireAddress = await query.findRentalAddress(
            variables.mint,
            anchorWallet.publicKey
          );

          queryClient.setQueryData<RentalPretty | undefined>(
            getRentalCacheKey(hireAddress),
            (data) => {
              if (data) {
                return {
                  ...data,
                  data: {
                    ...data.data,
                    currentStart: Date.now() / 1000,
                  },
                };
              }
            }
          );
        }
      },
    }
  );
}

interface CloseRentalMutation {
  mint: anchor.web3.PublicKey;
}

export function useCloseRentalMutation(onSuccess: () => void) {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseRentalMutation>(
    async ({ mint }) => {
      if (anchorWallet) {
        const lenderTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.closeRental(
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
      async onSuccess(_, variables) {
        queryClient.setQueryData<RentalPretty[] | undefined>(
          getRentalsGivenCacheKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<RentalPretty[] | undefined>(
          getRentalsCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        if (anchorWallet) {
          const hireAddress = await query.findRentalAddress(
            variables.mint,
            anchorWallet?.publicKey
          );

          setRentalState(queryClient, hireAddress, RentalStateEnum.Cancelled);
        }

        toast.success("Call option closed");

        onSuccess();
      },
    }
  );
}

function setRentalState(
  queryClient: QueryClient,
  hireAddress: anchor.web3.PublicKey,
  state: RentalStateEnum
) {
  queryClient.setQueryData<RentalPretty | undefined>(
    getRentalCacheKey(hireAddress),
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
