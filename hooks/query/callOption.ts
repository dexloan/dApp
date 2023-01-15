import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { CallOptionState } from "@prisma/client";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";

import * as query from "../../common/query";
import {
  CallOptionJson,
  CallOptionBidJson,
  GroupedCallOptionBidJson,
} from "../../common/types";
import { CallOptionSortCols } from "../../components/tables";

export interface CallOptionFilters {
  state?: CallOptionState;
  amount?: string;
  expiry?: string;
  strikePrice?: string;
  buyer?: string;
  seller?: string;
  collections?: string[];
  orderBy?: CallOptionSortCols;
  sortOrder?: "asc" | "desc";
}

export interface CallOptionBidFilters
  extends Omit<CallOptionFilters, "state" | "seller"> {}

function mapCallOptionColToPrismaCol(col: CallOptionSortCols) {
  return {
    asset: "collectionAddress",
    collection: "collectionAddress",
    cost: "amount",
    expiry: "expiry",
    strikePrice: "strikePrice",
  }[col];
}

function appendQueryParams(url: URL, params: CallOptionFilters) {
  if (params.state) {
    url.searchParams.append("state", params.state);
  }

  if (params.amount) {
    url.searchParams.append("amount", params.amount);
  }

  if (params.expiry) {
    url.searchParams.append("expiry", params.expiry);
  }

  if (params.strikePrice) {
    url.searchParams.append("basisPoints", params.strikePrice);
  }

  if (params.buyer) {
    url.searchParams.append("buyer", params.buyer);
  }

  if (params.seller) {
    url.searchParams.append("seller", params.seller);
  }

  if (params.collections instanceof Array) {
    params.collections.forEach((address) =>
      url.searchParams.append("collectionAddress", address)
    );
  }

  if (params.orderBy) {
    const prismaCol = mapCallOptionColToPrismaCol(params.orderBy);

    if (prismaCol) {
      url.searchParams.append("orderBy", prismaCol);
    }
  }

  if (params.sortOrder) {
    url.searchParams.append("sortOrder", params.sortOrder);
  }
}

export function fetchCallOptions(
  filters: CallOptionFilters
): Promise<CallOptionJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/call_option/asks`);

  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useCallOptionsQuery(filters: CallOptionFilters = {}) {
  return useQuery(["call_options", filters], () => fetchCallOptions(filters), {
    refetchOnWindowFocus: false,
  });
}

export function fetchCallOptionBids(
  filters: CallOptionBidFilters
): Promise<CallOptionBidJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/call_option/bids`);

  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useCallOptionBidsQuery(filters: CallOptionBidFilters = {}) {
  return useQuery(
    ["call_option_bids", filters],
    () => fetchCallOptionBids(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export function fetchGroupedCallOptionBids(
  filters: CallOptionBidFilters
): Promise<GroupedCallOptionBidJson[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_HOST}/api/call_option/offers/grouped`
  );
  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useGroupedCallOptionBidsQuery(
  filters: CallOptionBidFilters = {}
) {
  return useQuery(
    ["call_option_bids", "grouped", filters],
    () => fetchGroupedCallOptionBids(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const useCallOptionAddress = (
  mint?: anchor.web3.PublicKey,
  seller?: anchor.web3.PublicKey
) => {
  const [address, setAddress] = useState<anchor.web3.PublicKey>();

  useEffect(() => {
    if (mint && seller) {
      query.findCallOptionAddress(mint, seller).then((a) => setAddress(a));
    }
  }, [mint, seller]);

  return address;
};

export const getCallOptionCacheKey = (
  callOptionAddress: anchor.web3.PublicKey | undefined
) => ["callOption", callOptionAddress?.toBase58()];

export function useCallOptionQuery(
  callOptionAddress: anchor.web3.PublicKey | undefined
) {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionCacheKey(callOptionAddress),
    () => {
      if (callOptionAddress)
        return query.fetchCallOption(connection, callOptionAddress);
    },
    { enabled: Boolean(callOptionAddress) }
  );
}
