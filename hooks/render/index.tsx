import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";

import { EllipsisProgress } from "../../components/progress";

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
