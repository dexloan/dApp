import { web3 } from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import { CollectionJson } from "../../common/types";
import * as query from "../../common/query";

export async function fetchCollections() {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/collections`);
  return fetch(url).then((res) => res.json());
}

export const useCollectionsQuery = () => {
  return useQuery<void, unknown, CollectionJson[]>(
    ["collections"],
    () => fetchCollections(),
    {
      enabled: typeof window !== "undefined",
    }
  );
};

export async function fetchCollection(
  collectionMint: string
): Promise<CollectionJson> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_HOST}/api/collections/mint/${collectionMint}`
  );
  return fetch(url).then((res) => res.json());
}

export const useCollectionQuery = (collectionMint?: string) => {
  return useQuery(
    ["collection", collectionMint],
    () => {
      if (collectionMint) {
        return fetchCollection(collectionMint);
      }
    },
    {
      enabled: typeof window !== "undefined" && Boolean(collectionMint),
    }
  );
};

export const useCollectionPda = (mint?: web3.PublicKey) => {
  const [collectionPda, setCollectionPda] = useState<web3.PublicKey>();

  useEffect(() => {
    if (mint) {
      query
        .findCollectionAddress(mint)
        .then((pda) => setCollectionPda(pda))
        .catch();
    }
  }, [mint]);

  return collectionPda;
};
