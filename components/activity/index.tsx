import * as anchor from "@project-serum/anchor";
import * as borsh from "@project-serum/borsh";
import { Box, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useQuery } from "react-query";
import * as utils from "../../common/utils";
import { fetchParsedTransactions } from "../../common/query";

interface ActivityProps {
  mint?: string;
}

interface Activity {
  key: string;
  type: "mint" | "sale" | "listing" | "repay" | "loan" | "repossess";
  blockTime: number | null | undefined;
  lamports: anchor.BN;
}

export const Activity = ({ mint }: ActivityProps) => {
  const { connection } = useConnection();

  const activityQuery = useQuery(
    ["activity", mint],
    async () => {
      if (mint) {
        const parsedTransactions = await fetchParsedTransactions(
          connection,
          new anchor.web3.PublicKey(mint),
          20 // limit
        );
        return parsedTransactions.map(mapTransaction).filter(Boolean);
      }
    },
    { enabled: Boolean(mint), refetchOnWindowFocus: false }
  );

  function renderRightCol(activity: Activity) {
    switch (activity.type) {
      case "repossess":
        return (
          <Text fontWeight="medium" fontSize="sm">
            -
          </Text>
        );

      default:
        return (
          <Text fontWeight="medium" fontSize="sm">
            {utils.formatAmount(BigInt(activity.lamports.toString("hex")))}
          </Text>
        );
    }
  }

  function renderLabel(activity: Activity) {
    switch (activity.type) {
      case "mint":
        return "Minted";
      case "sale":
        return "Sold";
      case "listing":
        return "Listed on Dexloan";
      case "loan":
        return "Loan Issued";
      case "repay":
        return "Repaid Loan";
      case "repossess":
        return "Repossessed";
    }
  }

  function renderLeftCol(activity: Activity) {
    return (
      <Box>
        <Text color="gray.300" fontSize="sm" fontWeight="medium">
          {renderLabel(activity)}
        </Text>
        <Text color="gray.500" fontSize="xs" fontWeight="medium">
          {typeof activity.blockTime === "number" &&
            utils.formatBlockTime(activity.blockTime)}
        </Text>
      </Box>
    );
  }

  function renderActivityDetails(activity: Activity) {
    return (
      <>
        {renderLeftCol(activity)}
        {renderRightCol(activity)}
      </>
    );
  }

  return (
    <Box mt="8" mb="4">
      <Box
        bg="rgba(0,0,0,0.2)"
        border="1px"
        borderColor="gray.800"
        borderRadius="sm"
        p="4"
      >
        <Heading color="gray.400" size="sm" mb="4">
          Activity
        </Heading>
        {activityQuery.isLoading ? (
          <Flex justify="center" pt="8">
            <Spinner
              emptyColor="gray.200"
              color="gray.500"
              thickness="3px"
              size="sm"
            />
          </Flex>
        ) : (
          activityQuery.data?.map(
            (activity) =>
              activity && (
                <Box key={activity.key}>
                  <Flex justifyContent="space-between" pt="3" pb="3">
                    {renderActivityDetails(activity)}
                  </Flex>
                </Box>
              )
          )
        )}
      </Box>
    </Box>
  );
};

function mapTransaction(
  txn: anchor.web3.ParsedTransactionWithMeta | null,
  index: number,
  array: (anchor.web3.ParsedTransactionWithMeta | null)[]
): Activity | null {
  if (txn?.meta?.err) return null;

  if (txn?.meta?.logMessages) {
    const isBuyEvent = txn.meta.logMessages.some((log) => log.includes("Buy"));

    if (isBuyEvent) {
      return {
        key: txn.transaction.signatures[0],
        type: "sale",
        blockTime: txn.blockTime,
        lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
          new anchor.BN(txn.meta.postBalances[0])
        ),
      };
    }

    let isCallOption;

    if (
      txn.meta.logMessages.some((log) => {
        isCallOption = log.includes("AskCallOption");

        return (
          log.includes("InitListing") || log.includes("askLoan") || isCallOption
        );
      })
    ) {
      if ("data" in txn.transaction.message.instructions[0]) {
        const data = txn.transaction.message.instructions[0].data;
        const layout = borsh.u64("amount");
        const decoded = bs58.decode(data);

        return {
          key: txn.transaction.signatures[0],
          type: "listing",
          blockTime: txn.blockTime,
          lamports: layout.decode(
            Buffer.from(
              isCallOption ? decoded.slice(16, 24) : decoded.slice(8, 16)
            )
          ),
        };
      }
    }

    if (
      txn.meta.logMessages.some(
        (log) => log.includes("MakeLoan") || log.includes("GiveLoan")
      )
    ) {
      if ("data" in txn.transaction.message.instructions[0]) {
        return {
          key: txn.transaction.signatures[0],
          type: "loan",
          blockTime: txn.blockTime,
          lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
            new anchor.BN(txn.meta.postBalances[0])
          ),
        };
      }
    }

    if (txn.meta.logMessages.some((log) => log.includes("RepayLoan"))) {
      if ("data" in txn.transaction.message.instructions[0]) {
        return {
          key: txn.transaction.signatures[0],
          type: "repay",
          blockTime: txn.blockTime,
          lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
            new anchor.BN(txn.meta.postBalances[0])
          ),
        };
      }
    }

    if (txn.meta.logMessages.some((log) => log.includes("Repossess"))) {
      if ("data" in txn.transaction.message.instructions[0]) {
        return {
          key: txn.transaction.signatures[0],
          type: "repossess",
          blockTime: txn.blockTime,
          lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
            new anchor.BN(txn.meta.postBalances[0])
          ),
        };
      }
    }

    if (
      index === array.length - 1 &&
      txn.meta.logMessages.some((log) => log.includes("InitializeMint"))
    ) {
      return {
        key: txn.transaction.signatures[0],
        type: "mint",
        blockTime: txn.blockTime,
        lamports: new anchor.BN(txn.meta.preBalances[0]).sub(
          new anchor.BN(txn.meta.postBalances[0])
        ),
      };
    }
  }

  return null;
}
