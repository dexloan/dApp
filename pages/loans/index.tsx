import type { NextPage } from "next";
import * as anchor from "@project-serum/anchor";
import {
  Box,
  Container,
  Heading,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Loan } from "../../common/model";
import { LoanStateEnum } from "../../common/types";
import { useFloorPriceQuery, useLoansQuery } from "../../hooks/query";
import { useLTV } from "../../hooks/render";
import { ColumnHeader, NFTCell } from "../../components/table";

type SortCols = "duration" | "ltv" | "apy" | "amount";

const Loans: NextPage = () => {
  const [[sortCol, direction], setSortBy] = useState<[SortCols, number]>([
    "amount",
    1,
  ]);

  const loansQuery = useLoansQuery();
  const loans = useMemo(
    () =>
      (loansQuery.data?.map(Loan.fromJSON) || [])
        .filter((loan) => loan.state !== LoanStateEnum.Defaulted)
        .sort(compareBy(sortCol, direction)),
    [loansQuery.data, sortCol, direction]
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
        Loan Listings
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
              <LoanRow key={loan.publicKey.toBase58()} loan={loan} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

interface LoanRowProps {
  loan: Loan;
}

const LoanRow = ({ loan }: LoanRowProps) => {
  const router = useRouter();
  const floorPriceQuery = useFloorPriceQuery(loan?.metadata.data.symbol);

  const floorPrice = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPriceQuery.data]);

  const ltv = useLTV(loan?.data.amount, floorPriceQuery.data?.floorPrice);

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
            Floor {floorPrice ?? "..."}
          </Text>
        </Box>
      </Td>
    </Tr>
  );
};

export default Loans;

function compareBy(sortCol: SortCols, direction: number) {
  switch (sortCol) {
    case "duration": {
      return sortByDuration(direction);
    }

    case "ltv": {
      // TODO
      return sortByLTV(direction);
    }

    case "apy":
      return sortByBasisPoints(direction);

    case "amount":
      return sortByAmount(direction);

    default: {
      return (a: Loan) => {
        if (a.state === "listed") return -1;
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

function sortByLTV(direction: number) {
  return (...args: Loan[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.duration.sub(args[1].data.duration).toNumber();
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
