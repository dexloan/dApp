import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";

import { EllipsisProgress } from "../../components/progress";
import { useMetadata } from "../query";

export function useLTV(amount?: anchor.BN | null, floorPrice?: number) {
  return useMemo(() => {
    if (amount && floorPrice) {
      const percentage = Number((amount.toNumber() / floorPrice) * 100).toFixed(
        2
      );
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }, [amount, floorPrice]);
}

export function useCollectionName(metadata?: Metadata) {
  const query = useMetadata(metadata?.collection?.key);
  return query.data?.data.name ?? null;
}
