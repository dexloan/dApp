import * as anchor from "@project-serum/anchor";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { useQuery } from "react-query";
import * as utils from "../../utils";
import { fetchParsedTransactions } from "../../common/query";

interface ActivityProps {
  mint?: anchor.web3.PublicKey;
}

export function Activity({ mint }: ActivityProps) {
  const { connection } = useConnection();
  const transactionsQuery = useQuery(
    ["transactions", mint?.toBase58()],
    () => {
      if (mint) {
        return fetchParsedTransactions(connection, mint);
      }
    },
    { enabled: Boolean(mint), refetchOnWindowFocus: false }
  );

  const parsedActivity = useMemo(() => {
    if (transactionsQuery.data) {
      return transactionsQuery.data
        .map((txn) => {
          if (txn?.meta?.logMessages) {
            const isBuyEvent = txn.meta.logMessages.some((log) =>
              log.includes("Buy")
            );

            if (isBuyEvent) {
              return {
                key: txn.transaction.signatures[0],
                blockTime: txn.blockTime,
                lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
                  new anchor.BN(txn.meta.postBalances[0])
                ),
              };
            }
          }

          return null;
        })
        .filter(Boolean);
    }
  }, [transactionsQuery.data]);

  return (
    <Box>
      <Heading>Activity</Heading>
      {parsedActivity?.map(
        (activity) =>
          activity && (
            <Box key={activity.key}>
              <Text>
                {typeof activity.blockTime === "number" &&
                  utils.formatBlockTime(activity.blockTime)}
              </Text>
              <Text>Sold for {utils.formatAmount(activity.lamports, 2)}</Text>
            </Box>
          )
      )}
    </Box>
  );
}
