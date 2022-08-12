import * as anchor from "@project-serum/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import * as query from "../../common/query";

export const getTokenManagerCacheKey = (
  mint: anchor.web3.PublicKey | undefined,
  issuer: anchor.web3.PublicKey | undefined
) => ["token_manager", mint?.toBase58(), issuer?.toBase58()];

export function useTokenManagerQuery(
  mint: anchor.web3.PublicKey | undefined,
  issuer: anchor.web3.PublicKey | undefined
) {
  const { connection } = useConnection();

  return useQuery(
    getTokenManagerCacheKey(mint, issuer),
    () => {
      if (mint && issuer)
        return query.fetchTokenManager(connection, mint, issuer);
    },
    { enabled: Boolean(mint && issuer) }
  );
}
