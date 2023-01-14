import { Collection } from "@prisma/client";
import { web3 } from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import { CollectionJson } from "../../common/types";
import * as query from "../../common/query";

export const useCollectionsQuery = () => {
  return useQuery<void, unknown, Collection[]>(
    ["collections"],
    () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/collections`);
      return fetch(url).then((res) => res.json());
    },
    {
      enabled: typeof window !== "undefined",
    }
  );
};

export const useCollectionQuery = (collectionPda?: web3.PublicKey) => {
  return useQuery<void, unknown, CollectionJson>(
    ["collection", collectionPda?.toBase58()],
    async () => {
      if (collectionPda) {
        const url = new URL(
          `${
            process.env.NEXT_PUBLIC_HOST
          }/api/collections/mint/${collectionPda.toBase58()}`
        );
        return fetch(url).then((res) => res.json());
      }
    },
    {
      enabled: typeof window !== "undefined" && Boolean(collectionPda),
    }
  );
};

export const useCollectionByMintQuery = (mint?: string) => {
  return useQuery<void, unknown, CollectionJson>(
    ["collection", mint],
    async () => {
      if (mint) {
        const url = new URL(
          `${process.env.NEXT_PUBLIC_HOST}/api/collections/mint/${mint}`
        );
        return fetch(url).then((res) => res.json());
      }
    },
    {
      enabled: typeof window !== "undefined" && Boolean(mint),
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
