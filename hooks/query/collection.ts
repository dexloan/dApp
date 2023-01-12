import { Collection } from "@prisma/client";
import { web3 } from "@project-serum/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

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
  const { connection } = useConnection();

  return useQuery(
    ["collection", collectionPda?.toBase58()],
    async () => {
      if (collectionPda) {
        return query.fetchCollection(connection, collectionPda);
      }
    },
    {
      enabled: typeof window !== "undefined" && Boolean(collectionPda),
    }
  );
};

export const useCollectionByMintQuery = (mint?: web3.PublicKey) => {
  const collectionPda = useCollectionPda(mint);
  return useCollectionQuery(collectionPda);
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
