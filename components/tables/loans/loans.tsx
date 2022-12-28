import * as anchor from "@project-serum/anchor";
import { Box, Flex, Tr, Th, Td, Text, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { useRouter } from "next/router";

import { Loan, LoanPretty } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { Col, ColumnHeader, ListingsTable, NFTCell } from "../../table";
import {
  LoanRow,
  LoanSortCols,
  useLoanSortState,
  useSortedLoans,
} from "./common";
import { EllipsisProgress } from "../../progress";

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
        <LoanAskRow
          key={item.address}
          loan={item}
          onClick={() => router.push(`/loans/${item.address}`)}
        />
      )}
    />
  );
};

interface LoanRowProps {
  loan: Loan;
  onClick: () => void;
}

const LoanAskRow = ({ loan, onClick }: LoanRowProps) => {
  const floorPriceQuery = useFloorPriceQuery(loan?.metadata.data.symbol);

  const floorPriceSol = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data?.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPriceQuery.data]);

  const ltv = useLTV(loan?.data.amount, floorPriceQuery.data?.floorPrice);

  return (
    <LoanRow
      amount={loan.amount}
      duration={loan.duration}
      apy={loan.apy}
      lenderApy={loan.lenderApy}
      creatorApy={loan.creatorApy}
      ltv={ltv}
      floorPriceSol={floorPriceSol}
      metadata={loan.metadata}
      onClick={onClick}
    />
  );
};
