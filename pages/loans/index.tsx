import type { NextPage } from "next";
import {
  Container,
  Heading,
  Box,
  Skeleton,
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
import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import Image from "next/image";

import { Loan } from "../../common/model";
import { LoanStateEnum } from "../../common/types";
import { useLoansQuery, useMetadataFileQuery } from "../../hooks/query";
import { useRouter } from "next/router";

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
      <Heading as="h1" color="gray.200" size="sm" mt="12" mb="1">
        Loan Listings
      </Heading>
      <TableContainer maxW="100%" mt="2" mb="6" width="100%">
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
                direction={sortCol === "ltv" ? direction : 0}
                onClick={() => sort("ltv")}
              >
                LTV
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "apy" ? direction : 0}
                onClick={() => sort("apy")}
              >
                Loan APY
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

interface ColumnHeaderProps {
  children: string;
  direction?: number;
  isNumeric?: boolean;
  onClick: () => void;
}

const ColumnHeader = ({
  children,
  isNumeric,
  direction,
  onClick,
}: ColumnHeaderProps) => {
  return (
    <Th>
      <Box
        display="flex"
        alignItems="center"
        cursor="pointer"
        justifyContent={isNumeric ? "flex-end" : "flex-start"}
        onClick={onClick}
      >
        <Box textAlign={isNumeric ? "right" : undefined}>{children}</Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          ml="2"
        >
          <Box as="span" position="relative" top="2px">
            <IoCaretUp color={direction === 1 ? "red.600" : undefined} />
          </Box>
          <Box as="span" position="relative" bottom="2px">
            <IoCaretDown color={direction === -1 ? "red.600" : undefined} />
          </Box>
        </Box>
      </Box>
    </Th>
  );
};

interface LoanRowProps {
  loan: Loan;
}

const LoanRow = ({ loan }: LoanRowProps) => {
  const router = useRouter();
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataFileQuery(loan.metadata.data.uri);

  return (
    <Tr
      key={loan.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => router.push(`/loans/${loan.publicKey.toBase58()}`)}
    >
      <Td>
        <Box display="flex" alignItems="center">
          <Box
            as="span"
            display="block"
            position="relative"
            width="12"
            height="12"
            borderRadius="sm"
            overflow="hidden"
          >
            <Box
              as="span"
              position="absolute"
              left="0"
              top="0"
              right="0"
              bottom="0"
            >
              <Skeleton
                height="100%"
                width="100%"
                isLoaded={metadataQuery.data?.image && isVisible}
              >
                {metadataQuery.data?.image && (
                  <Image
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                    src={metadataQuery.data?.image}
                    alt={loan.metadata.data.name}
                    onLoad={() => setVisible(true)}
                  />
                )}
              </Skeleton>
            </Box>
          </Box>
          <Text ml="4">{loan.metadata.data.name}</Text>
        </Box>
      </Td>
      <Td>{loan.duration}</Td>
      <Td isNumeric>50%</Td>
      <Td isNumeric>{loan.apy}</Td>
      <Td isNumeric>{loan.amount}</Td>
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
    return args[0].data.duration.sub(args[1].data.duration).toNumber();
  };
}
