import * as anchor from "@project-serum/anchor";
import {
  Box,
  Button,
  Heading,
  Icon,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import * as utils from "../../common/utils";
import { Loan } from "../../common/model";
import { useLoansQuery, useFloorPricesQuery } from "../../hooks/query";
import { useLTV } from "../../hooks/render";
import { ColumnHeader, NFTCell } from "../../components/table";
import { sortReducer, LoanSortState, LoanSortCols } from "./common";

export const LoanAsks = () => {
  const [[sortCol, direction], setSortBy] = useState<LoanSortState>([
    "amount",
    1,
  ]);

  const loansQuery = useLoansQuery();
  const floorPricesQuery = useFloorPricesQuery();

  const loans = useMemo(
    () =>
      (loansQuery.data?.map(Loan.fromJSON) ?? []).sort(
        compareBy(sortCol, direction, floorPricesQuery.data)
      ),
    [loansQuery.data, floorPricesQuery.data, sortCol, direction]
  );

  function sort(col: LoanSortCols) {
    setSortBy(sortReducer(col));
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="2"
      >
        <Heading as="h3" color="gray.200" size="sm">
          Asks
        </Heading>
        <Button size="sm" leftIcon={<Icon as={IoAdd} />}>
          Create Ask
        </Button>
      </Box>
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
              <Th>Collateral</Th>
              <ColumnHeader
                direction={sortCol === "duration" ? direction : 0}
                onClick={() => sort("duration")}
              >
                Duration
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "apy" ? direction : 0}
                onClick={() => sort("apy")}
              >
                APY
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "ltv" ? direction : 0}
                onClick={() => sort("ltv")}
              >
                LTV
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "amount" ? direction : 0}
                onClick={() => sort("amount")}
              >
                Borrowing
              </ColumnHeader>
            </Tr>
          </Thead>
          <Tbody>
            {loans.map((loan) => (
              <LoanRow
                key={loan.publicKey.toBase58()}
                loan={loan}
                floorPrices={floorPricesQuery.data}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

interface LoanRowProps {
  loan: Loan;
  floorPrices?: Record<string, number>;
}

const LoanRow = ({ loan, floorPrices = {} }: LoanRowProps) => {
  const router = useRouter();

  const floorPrice = utils.getFloorPrice(
    floorPrices,
    loan?.metadata.data.symbol
  );
  const floorPriceSol = useMemo(() => {
    if (floorPrice) {
      return floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPrice]);

  const ltv = useLTV(loan?.data.amount, floorPrice);

  return (
    <Tr
      key={loan.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => router.push(`/loans/${loan.publicKey.toBase58()}`)}
    >
      <NFTCell metadata={loan?.metadata} />
      <Td>{loan.duration}</Td>
      <Td isNumeric>{loan.apy}</Td>
      <Td isNumeric>{ltv}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">{loan.amount}</Text>
          <Text fontSize="xs" color="gray.500">
            Floor {floorPriceSol ?? "..."}
          </Text>
        </Box>
      </Td>
    </Tr>
  );
};

function compareBy(
  sortCol: LoanSortCols,
  direction: number,
  floorPrices?: Record<string, number>
) {
  switch (sortCol) {
    case "duration": {
      return sortByDuration(direction);
    }

    case "ltv": {
      // TODO
      return sortByLTV(direction, floorPrices);
    }

    case "apy":
      return sortByBasisPoints(direction);

    case "amount":
      return sortByAmount(direction);

    default: {
      return () => {
        return 1;
      };
    }
  }
}

function sortByAmount(direction: number) {
  return (...args: Loan[]) => {
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

function sortByBasisPoints(direction: number) {
  return (...args: Loan[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.basisPoints - args[1].data.basisPoints;
  };
}

function sortByLTV(direction: number, floorPrices?: Record<string, number>) {
  return (...args: Loan[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (!floorPrices) {
      return -1;
    }

    const floorPriceA = utils.getFloorPrice(
      floorPrices,
      args[0]?.metadata.data.symbol
    );
    const floorPriceB = utils.getFloorPrice(
      floorPrices,
      args[1]?.metadata.data.symbol
    );
    const amountA = args[0].data.amount;
    const amountB = args[1].data.amount;

    if (floorPriceA && floorPriceB && amountA && amountB) {
      const ltvA = Number((amountA.toNumber() / floorPriceA) * 100);
      const ltvB = Number((amountB.toNumber() / floorPriceB) * 100);

      return ltvA - ltvB;
    }

    return -1;
  };
}

function sortByDuration(direction: number) {
  return (...args: Loan[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.duration.sub(args[1].data.duration).toNumber();
  };
}
