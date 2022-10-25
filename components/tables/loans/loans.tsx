import * as anchor from "@project-serum/anchor";
import {
  Box,
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
import { useMemo } from "react";
import { useRouter } from "next/router";

import { Loan } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { ColumnHeader, EmptyMessage, NFTCell } from "../../table";
import { LoanSortFn, LoanSortCols } from "./common";

interface LoanListingsProps {
  heading: string;
  placeholderMessage: string;
  action?: React.ReactNode;
  loans: Loan[];
  direction: number;
  sortCol: LoanSortCols;
  onSort: LoanSortFn;
}

export const LoanListings = ({
  heading,
  placeholderMessage,
  action = null,
  loans,
  sortCol,
  direction,
  onSort,
}: LoanListingsProps) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="2"
      >
        <Heading as="h3" color="gray.200" size="sm">
          {heading}
        </Heading>
        {action}
      </Box>
      {loans.length ? (
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
                  onClick={() => onSort("duration")}
                >
                  Duration
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "apy" ? direction : 0}
                  onClick={() => onSort("apy")}
                >
                  APY
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "ltv" ? direction : 0}
                  onClick={() => onSort("ltv")}
                >
                  LTV
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "amount" ? direction : 0}
                  onClick={() => onSort("amount")}
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
      ) : (
        <EmptyMessage>{placeholderMessage}</EmptyMessage>
      )}
    </>
  );
};

interface LoanRowProps {
  loan: Loan;
  floorPrices?: Record<string, number>;
}

const LoanRow = ({ loan }: LoanRowProps) => {
  const router = useRouter();

  const floorPriceQuery = useFloorPriceQuery(loan?.metadata.data.symbol);

  const floorPriceSol = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data?.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
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
            Floor {floorPriceSol ?? "..."}
          </Text>
        </Box>
      </Td>
    </Tr>
  );
};
