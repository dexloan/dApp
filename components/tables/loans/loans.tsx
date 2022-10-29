import * as anchor from "@project-serum/anchor";
import { Box, Tr, Th, Td, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useRouter } from "next/router";

import { Loan, LoanPretty } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { Col, ColumnHeader, ListingsTable, NFTCell } from "../../table";
import { LoanSortCols, useLoanSortState, useSortedLoans } from "./common";

const LOAN_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "asset", label: "Asset" },
  { name: "duration", label: "Duration" },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanListingsProps {
  heading: string;
  placeholderMessage: string;
  action?: React.ReactNode;
  loans?: LoanPretty[];
}

export const LoanListings = ({
  heading,
  placeholderMessage,
  action = null,
  loans,
}: LoanListingsProps) => {
  const router = useRouter();
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(loans, sortState);

  return (
    <ListingsTable<LoanSortCols, Loan>
      heading={heading}
      placeholder={placeholderMessage}
      action={action}
      cols={LOAN_COLS}
      items={sortedLoans}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
        }

        return (
          <ColumnHeader
            key={col.name}
            isNumeric={col.isNumeric}
            direction={sortState[0] === col.name ? sortState[1] : 0}
            onClick={() => onSort(col.name)}
          >
            {col.label}
          </ColumnHeader>
        );
      }}
      renderRow={(item) => (
        <LoanRow
          key={item.address}
          loan={item}
          onClick={() => router.push(`/options/${item.address}`)}
        />
      )}
    />
  );
};

interface LoanRowProps {
  loan: Loan;
  floorPrices?: Record<string, number>;
  onClick: () => void;
}

const LoanRow = ({ loan, onClick }: LoanRowProps) => {
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
      onClick={onClick}
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
