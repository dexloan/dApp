import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { CallOptionState } from "@prisma/client";

import * as utils from "../../common/utils";
import * as actions from "../../common/actions";
import * as query from "../../common/query";
import {
  CallOptionJson,
  CallOptionBidJson,
  CollectionJson,
  GroupedCallOptionBidJson,
} from "../../common/types";
import {
  fetchMetadata,
  findCallOptionAddress,
  findCollectionAddress,
  findMetadataAddress,
} from "../../common/query";
import {
  CallOptionFilters,
  fetchCallOptionBids,
  fetchCollection,
} from "../query";

export interface BidCallOptionMutationVariables {
  collectionMint: anchor.web3.PublicKey;
  options: {
    count: number;
    amount: number;
    strikePrice: number;
    expiry: number;
  };
}

function pickOfferIds(offers: CallOptionBidJson[], count: number) {
  const ids = [];
  const existingIds = offers.map((offer) => offer.bidId);

  let id = 0;
  while (ids.length < count && id <= 255) {
    if (!existingIds.includes(id)) {
      ids.push(id);
    }
    id++;
  }

  return ids;
}

export const useBidCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    async (variables: BidCallOptionMutationVariables) => {
      if (anchorWallet) {
        const collection = await query.findCollectionAddress(
          variables.collectionMint
        );
        const currentOffers = await fetchCallOptionBids({
          buyer: anchorWallet.publicKey.toBase58(),
          collections: [collection.toBase58()],
        });
        const ids = pickOfferIds(currentOffers, variables.options.count);
        console.log("current offers: ", currentOffers);
        console.log("next offers: ", ids);

        return actions.bidCallOption(
          connection,
          anchorWallet,
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
      async onSuccess(newBids, variables) {
        if (anchorWallet) {
          const collectionPda = await findCollectionAddress(
            variables.collectionMint
          );
          const collection = await queryClient.fetchQuery<CollectionJson>(
            ["collection", variables.collectionMint.toBase58()],
            () => fetchCollection(variables.collectionMint.toBase58())
          );

          const amount = utils.toHexString(variables.options.amount);
          const strikePrice = utils.toHexString(variables.options.strikePrice);
          const expiry = utils.toHexString(variables.options.expiry);
          const buyer = anchorWallet.publicKey.toBase58();
          const callOptionBids: CallOptionBidJson[] = newBids.map(
            ([address, id]) => ({
              address: address.toBase58(),
              bidId: id,
              amount,
              strikePrice,
              expiry,
              buyer,
              ltv: null,
              collectionAddress: collection.address,
              Collection: collection,
            })
          );

          const groupedOffer: GroupedCallOptionBidJson = {
            _count: callOptionBids.length,
            amount,
            strikePrice,
            expiry,
            Collection: collection,
          };

          const queryCache = queryClient.getQueryCache();
          const groupedQueries = queryCache.findAll(
            ["call_option_bids", "grouped"],
            {
              exact: false,
            }
          );
          groupedQueries.forEach((query) => {
            if (
              query.queryKey[2] &&
              typeof query.queryKey[2] === "object" &&
              "collection" in query.queryKey[2] &&
              query.queryKey[2].collection !== collectionPda.toBase58()
            ) {
              return;
            }

            queryClient.setQueryData<GroupedCallOptionBidJson[]>(
              query.queryKey,
              (groupedOffers = []) => {
                let shouldAppend = true;

                const updated = groupedOffers.map((o) => {
                  if (
                    o.amount === groupedOffer.amount &&
                    o.strikePrice === groupedOffer.strikePrice &&
                    o.expiry === groupedOffer.expiry &&
                    o.Collection.address === groupedOffer.Collection.address
                  ) {
                    shouldAppend = false;
                    return {
                      ...o,
                      _count: o._count + callOptionBids.length,
                    };
                  }
                  return o;
                });

                if (shouldAppend) {
                  updated.push(groupedOffer);
                }

                return updated;
              }
            );
          });
          const bidQueries = queryCache.findAll(["call_option_bids", "all"], {
            exact: false,
          });
          bidQueries.forEach((query) => {
            const filters = query.queryKey[2] as CallOptionFilters | undefined;

            if (!filters) return;

            if (
              filters.collections?.includes(groupedOffer.Collection.address) &&
              filters.amount === amount &&
              filters.strikePrice === strikePrice &&
              filters.expiry === expiry
            ) {
              queryClient.setQueryData<CallOptionBidJson[]>(
                query.queryKey,
                (bids = []) => {
                  return [...bids, ...callOptionBids];
                }
              );
            }
          });
        }

        await queryClient.invalidateQueries(["call_option_bids"]);
        toast.success("Call option bid(s) created");
        onSuccess();
      },
    }
  );
};

interface SellCallOptionMutation {
  mint: anchor.web3.PublicKey;
  bid: CallOptionBidJson;
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
        removeCallOptionBid(queryClient, variables.bid);
        removeBidFromGroupedCallOptionBids(queryClient, variables.bid);
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

  return useMutation<void, Error, CallOptionBidJson>(
    async (variables) => {
      if (anchorWallet) {
        return actions.closeBid(connection, anchorWallet, variables);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        removeCallOptionBid(queryClient, variables);
        removeBidFromGroupedCallOptionBids(queryClient, variables);
        toast.success("Call option bid closed");
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

export interface AskCallOptionMutationVariables {
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
        if (anchorWallet) {
          const callOptionPda = await findCallOptionAddress(
            variables.mint,
            anchorWallet?.publicKey
          );
          const collectionPda = await findCollectionAddress(variables.mint);
          const [metdataPda] = await findMetadataAddress(variables.mint);

          const metadata = await queryClient.fetchQuery(
            ["metadata", metdataPda.toBase58()],
            () => fetchMetadata(connection, metdataPda)
          );
          const collection = await queryClient.fetchQuery(
            ["collection", variables.collectionMint.toBase58()],
            () => fetchCollection(variables.collectionMint.toBase58())
          );

          const newCallOption: CallOptionJson = {
            address: callOptionPda.toBase58(),
            amount: utils.toHexString(variables.options.amount),
            strikePrice: utils.toHexString(variables.options.strikePrice),
            expiry: utils.toHexString(variables.options.expiry),
            state: CallOptionState.Listed,
            mint: variables.mint.toBase58(),
            seller: anchorWallet.publicKey.toBase58(),
            buyer: null,
            creatorBasisPoints: collection.optionBasisPoints,
            tokenMint: null,
            uri: metadata?.data.uri ?? "",
            collectionAddress: collectionPda.toBase58(),
            Collection: collection,
          };

          const queryCache = queryClient.getQueryCache();
          const queries = queryCache.findAll(["call_options"], {
            exact: false,
          });

          queries
            .map((query) => query.queryKey)
            .forEach((key) => {
              if (
                key[1] &&
                typeof key[1] === "object" &&
                "collection" in key[1] &&
                key[1].collection !== collectionPda.toBase58()
              ) {
                return;
              }

              queryClient.setQueryData<CallOptionJson[]>(
                key,
                (callOptions = []) => {
                  return [...callOptions, newCallOption];
                }
              );
            });

          queryClient.setQueriesData(
            ["call_option", callOptionPda.toBase58()],
            newCallOption
          );
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
        const callOptionPda = await findCallOptionAddress(
          variables.mint,
          variables.seller
        );
        removeCallOptionFromList(queryClient, callOptionPda.toBase58());
        updateCallOption(queryClient, callOptionPda.toBase58(), {
          state: CallOptionState.Cancelled,
        });
        toast.success("Call Option closed");
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
  collectionMint: anchor.web3.PublicKey;
}

export const useBuyCallOptionMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, BuyCallOptionVariables>(
    async ({ mint, seller, collectionMint }) => {
      if (anchorWallet) {
        return actions.buyCallOption(
          connection,
          anchorWallet,
          mint,
          seller,
          collectionMint
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        if (anchorWallet?.publicKey) {
          const callOptionPda = await query.findCallOptionAddress(
            variables.mint,
            variables.seller
          );

          removeCallOptionFromList(queryClient, callOptionPda.toBase58());
          updateCallOption(queryClient, callOptionPda.toBase58(), {
            buyer: anchorWallet.publicKey.toBase58(),
            state: CallOptionState.Active,
          });
        }
        toast.success("Call option purchased");
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
}

export const useExerciseCallOptionMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ExerciseCallOptionVariables>(
    async ({ mint, seller }) => {
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
          seller
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
        const callOptionPda = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );
        await queryClient.invalidateQueries(["call_option", callOptionPda]);
        updateCallOption(queryClient, callOptionPda.toBase58(), {
          state: CallOptionState.Exercised,
        });
        toast.success("Option exercised");
        onSuccess();
      },
    }
  );
};

function removeCallOptionBid(
  queryClient: QueryClient,
  callOptionBid: CallOptionBidJson
) {
  const queryCache = queryClient.getQueryCache();
  const bidQueries = queryCache.findAll(["call_option_bids", "all"], {
    exact: false,
  });
  bidQueries.forEach((query) => {
    queryClient.setQueryData<CallOptionBidJson[]>(query.queryKey, (bids = []) =>
      bids.filter((b) => b.address !== callOptionBid.address)
    );
  });
}

function removeBidFromGroupedCallOptionBids(
  queryClient: QueryClient,
  callOptionBid: CallOptionBidJson
) {
  const queryCache = queryClient.getQueryCache();
  const groupedQueries = queryCache.findAll(["call_option_bids", "grouped"], {
    exact: false,
  });
  groupedQueries.forEach((query) => {
    queryClient.setQueryData<GroupedCallOptionBidJson[]>(
      query.queryKey,
      (groupedBids = []) => {
        return groupedBids
          .map((o) => {
            if (
              o.amount === callOptionBid.amount &&
              o.strikePrice === callOptionBid.strikePrice &&
              o.expiry === callOptionBid.expiry &&
              o.Collection.address === callOptionBid.Collection.address
            ) {
              if (o._count === 1) {
                return null;
              }

              return {
                ...o,
                _count: o._count - 1,
              };
            }
            return o;
          })
          .filter(utils.notNull);
      }
    );
  });
}

function updateCallOption(
  queryClient: QueryClient,
  key: string,
  update: Partial<CallOptionJson>
) {
  queryClient.setQueryData<CallOptionJson | undefined>(
    ["call_option", key],
    (data) => {
      if (data) {
        return {
          ...data,
          ...update,
        };
      }
    }
  );
}

function removeCallOptionFromList(queryClient: QueryClient, key: string) {
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.findAll(["loans"], {
    exact: false,
  });

  queries.forEach((query) => {
    queryClient.setQueryData<CallOptionJson[]>(query.queryKey, (options = []) =>
      options.filter((o) => o.address !== key)
    );
  });
}
