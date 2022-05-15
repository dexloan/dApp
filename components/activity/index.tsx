import * as anchor from "@project-serum/anchor";
import {
  Box,
  Divider,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import * as utils from "../../utils";
import { fetchParsedTransactions } from "../../common/query";

interface ActivityProps {
  mint?: anchor.web3.PublicKey;
}

interface Activity {
  key: string;
  type: "buy" | "listing";
  blockTime: number | null | undefined;
  lamports: anchor.BN;
}

export function Activity({ mint }: ActivityProps) {
  const { connection } = useConnection();

  const activityQuery = useQuery(
    ["activity", mint?.toBase58()],
    async () => {
      if (mint) {
        const parsedTransactions = await fetchParsedTransactions(
          connection,
          mint
        );

        return parsedTransactions.map(mapTransaction).filter(Boolean);
      }
    },
    { enabled: Boolean(mint), refetchOnWindowFocus: false }
  );

  function renderActivityDetails(activity: Activity) {
    switch (activity.type) {
      case "buy":
        return (
          <Text>
            Sold for{" "}
            <Text as="span" fontWeight="semibold">
              {utils.formatAmount(activity.lamports, 2)}
            </Text>
          </Text>
        );

      case "listing":
        return (
          <Text>
            Listed for{" "}
            <Text as="span" fontWeight="semibold">
              {utils.formatAmount(activity.lamports, 2)}
            </Text>
          </Text>
        );

      default:
        return null;
    }
  }

  return (
    <Box pt="6" pb="6">
      <Heading size="md" mb="6">
        Activity
      </Heading>
      <Divider mb="2" />
      {activityQuery.isLoading ? (
        <Stack>
          <Skeleton h="8" />
          <Skeleton h="8" />
        </Stack>
      ) : (
        activityQuery.data?.map(
          (activity) =>
            activity && (
              <Flex
                key={activity.key}
                justifyContent="space-between"
                pt="4"
                pb="4"
              >
                <Text color="gray.500" fontWeight="medium">
                  {typeof activity.blockTime === "number" &&
                    utils.formatBlockTime(activity.blockTime)}
                </Text>
                {renderActivityDetails(activity)}
              </Flex>
            )
        )
      )}
    </Box>
  );
}

function mapTransaction(
  txn: anchor.web3.ParsedTransactionWithMeta | null
): Activity | null {
  if (txn?.meta?.logMessages) {
    const isBuyEvent = txn.meta.logMessages.some((log) => log.includes("Buy"));

    if (isBuyEvent) {
      return {
        key: txn.transaction.signatures[0],
        type: "buy",
        blockTime: txn.blockTime,
        lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
          new anchor.BN(txn.meta.postBalances[0])
        ),
      };
    }

    const isListing = txn.meta.logMessages.some((log) =>
      log.includes("InitListing")
    );

    if (isListing) {
      let data: null | string = null;

      if ("data" in txn.transaction.message.instructions[0]) {
        data = txn.transaction.message.instructions[0].data;
        // TODO decode the listing price
      }

      return {
        key: txn.transaction.signatures[0],
        type: "listing",
        blockTime: txn.blockTime,
        lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
          new anchor.BN(txn.meta.postBalances[0])
        ),
      };
    }
  }

  return null;
}
