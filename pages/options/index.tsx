import type { NextPage } from "next";
import {
  Container,
  Heading,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { CallOption } from "../../common/model";
import { CallOptionStateEnum } from "../../common/types";
import { useCallOptionsQuery } from "../../hooks/query";
import { ColumnHeader, NFTCell } from "../../components/table";

type SortCols = "expiry" | "strikePrice" | "cost";

const CallOptions: NextPage = () => {
  const [[sortCol, direction], setSortBy] = useState<[SortCols, number]>([
    "expiry",
    1,
  ]);

  const callOptionsQuery = useCallOptionsQuery();
  const callOptions = useMemo(
    () =>
      (callOptionsQuery.data?.map(CallOption.fromJSON) || []).sort(
        compareBy(sortCol, direction)
      ),
    [callOptionsQuery.data, sortCol, direction]
  );

  function sort(col: SortCols) {
    setSortBy((state) => {
      if (state[0] === col) {
        return [state[0], state[1] * -1];
      }
      return [col, 1];
    });
  }

  return (
    <Container maxW="container.lg">
      <Heading as="h1" color="gray.200" size="sm" mt="12" mb="2">
        Call Options
      </Heading>
      <TableContainer
        maxW="100%"
        mt="2"
        mb="6"
        borderTop="1px"
        borderColor="gray.800"
        width="100%"
      >
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Asset</Th>
              <ColumnHeader
                direction={sortCol === "expiry" ? direction : 0}
                onClick={() => sort("expiry")}
              >
                Expiry
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "strikePrice" ? direction : 0}
                onClick={() => sort("strikePrice")}
              >
                Strike Price
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "cost" ? direction : 0}
                onClick={() => sort("cost")}
              >
                Cost
              </ColumnHeader>
            </Tr>
          </Thead>
          <Tbody>
            {callOptions.map((option) => (
              <OptionRow key={option.publicKey.toBase58()} option={option} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

interface OptionRowProps {
  option: CallOption;
}

const OptionRow = ({ option }: OptionRowProps) => {
  const router = useRouter();

  return (
    <Tr
      key={option.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => router.push(`/options/${option.publicKey.toBase58()}`)}
    >
      <NFTCell metadata={option?.metadata} />
      <Td>{option.expiry}</Td>
      <Td isNumeric>{option.strikePrice}</Td>
      <Td isNumeric>{option.cost}</Td>
    </Tr>
  );
};

export default CallOptions;

function compareBy(sortCol: SortCols, direction: number) {
  switch (sortCol) {
    case "expiry":
      return sortByExpiry(direction);

    case "strikePrice":
      return sortByStrikePrice(direction);

    case "cost":
      return sortByCost(direction);

    default:
      return (a: CallOption) => {
        if (a.state === "listed") return -1;
        return 1;
      };
  }
}

function sortByExpiry(direction: number) {
  return (...args: CallOption[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (args[0].data.amount) {
      if (args[1].data.amount) {
        return args[0].data.amount.sub(args[1].data.amount).toNumber();
      }
      return 1;
    }
    return -1;
  };
}

function sortByStrikePrice(direction: number) {
  return (...args: CallOption[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.strikePrice.sub(args[1].data.strikePrice).toNumber();
  };
}

function sortByCost(direction: number) {
  return (...args: CallOption[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.amount.sub(args[1].data.amount).toNumber();
  };
}
