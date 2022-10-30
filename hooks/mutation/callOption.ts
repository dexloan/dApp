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
import { CallOptionStateEnum, NftResult } from "../../common/types";
import {
  getCallOptionCacheKey,
  getCallOptionsCacheKey,
  getBuyerCallOptionsQueryKey,
  getSellerCallOptionsQueryKey,
  getNftByOwnerCacheKey,
  getCallOptionBidsCacheKey,
} from "../query";
import {
  CallOptionBid,
  CallOptionBidPretty,
  CallOptionPretty,
} from "../../common/model";

export interface BidCallOptionMutationVariables {
  collection: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  };
  ids: number[];
}

export const useBidCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: BidCallOptionMutationVariables) => {
      if (anchorWallet) {
        return actions.bidCallOption(
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
          queryClient.invalidateQueries(getCallOptionBidsCacheKey());
        }

        const count = variables.ids.length;
        toast.success(
          `${count} bid${variables.ids.length > 1 ? "s" : ""} created`
        );

        onSuccess();
      },
    }
  );
};

interface SellCallOptionMutation {
  mint: anchor.web3.PublicKey;
  bid: CallOptionBid;
}

export const useSellCallOptionMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, SellCallOptionMutation>(
    async (variables) => {
      if (anchorWallet) {
        return actions.sellCallOption(
          connection,
          anchorWallet,
          variables.mint,
          variables.bid
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        queryClient.setQueryData<CallOptionBidPretty[] | undefined>(
          getCallOptionBidsCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.publicKey !== variables.bid.publicKey.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getSellerCallOptionsQueryKey(anchorWallet?.publicKey)
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

export const useCloseCallOptionBidMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CallOptionBid>(
    async (variables) => {
      if (anchorWallet) {
        return actions.closeBid(connection, anchorWallet, variables);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        queryClient.setQueryData<CallOptionBidPretty[] | undefined>(
          getCallOptionBidsCacheKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.publicKey !== variables.publicKey.toBase58()
              );
            }
          }
        );

        toast.success("Bid closed");

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

interface AskCallOptionMutationVariables {
  mint: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  };
}

export const useAskCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: AskCallOptionMutationVariables) => {
      if (anchorWallet) {
        return actions.askCallOption(
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
          const callOptionAddress = await query.findCallOptionAddress(
            variables.mint,
            anchorWallet.publicKey
          );

          try {
            const callOption = await query.waitForCallOption(
              connection,
              callOptionAddress
            );

            queryClient.setQueryData(
              getCallOptionCacheKey(callOptionAddress),
              callOption
            );
          } catch {}
        }

        toast.success("Listing created");

        onSuccess();
      },
    }
  );
};

interface CloseCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
}

export const useCloseCallOptionMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseCallOptionVariables>(
    async ({ mint }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.closeCallOption(
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
        queryClient.setQueryData<CallOptionPretty[] | undefined>(
          getSellerCallOptionsQueryKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<CallOptionPretty[] | undefined>(
          getCallOptionsCacheKey(0),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        const callOptionAddress = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );

        setCallOptionState(
          queryClient,
          callOptionAddress,
          CallOptionStateEnum.Cancelled
        );

        toast.success("Call option closed");

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

interface BuyCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
}

export const useBuyCallOptionMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, BuyCallOptionVariables>(
    async ({ mint, seller }) => {
      if (anchorWallet) {
        return actions.buyCallOption(connection, anchorWallet, mint, seller);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const callOptionAddress = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );

        queryClient.setQueryData<CallOptionPretty[] | undefined>(
          getCallOptionsCacheKey(0),
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
              getBuyerCallOptionsQueryKey(anchorWallet?.publicKey)
            ),
          500
        );

        queryClient.setQueryData<CallOptionPretty | undefined>(
          getCallOptionCacheKey(callOptionAddress),
          (item) => {
            if (item && anchorWallet) {
              return {
                ...item,
                data: {
                  ...item.data,
                  state: CallOptionStateEnum.Active,
                  buyer: anchorWallet.publicKey.toBase58(),
                },
              };
            }
          }
        );

        toast.success("Call option bought");

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

interface ExerciseCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
  metadata: Metadata;
}

export const useExerciseCallOptionMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ExerciseCallOptionVariables>(
    async ({ mint, seller, metadata }) => {
      if (anchorWallet && wallet.publicKey) {
        const buyerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.exerciseCallOption(
          connection,
          anchorWallet,
          mint,
          buyerTokenAccount,
          seller,
          metadata
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
        queryClient.setQueryData(
          getBuyerCallOptionsQueryKey(anchorWallet?.publicKey),
          (items: CallOptionPretty[] | undefined) => {
            if (!items) return [];

            return items.filter(
              (item) => item.data.mint !== variables.mint.toBase58()
            );
          }
        );

        setCallOptionState(
          queryClient,
          variables.mint,
          CallOptionStateEnum.Exercised
        );

        toast.success("Option exercised");

        onSuccess();
      },
    }
  );
};

function setCallOptionState(
  queryClient: QueryClient,
  callOption: anchor.web3.PublicKey,
  state: CallOptionStateEnum
) {
  queryClient.setQueryData<CallOptionPretty | undefined>(
    getCallOptionCacheKey(callOption),
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
