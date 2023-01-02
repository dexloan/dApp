import { Th } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { Loan, LoanPretty } from "../../../common/model";
import { Col, ColumnHeader, ListingsTable } from "../../table";
import {
  LoanRow,
  LoanSortCols,
  useLoanSortState,
  useSortedLoans,
} from "./common";

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
    <ListingsTable<LoanSortCols, LoanPretty>
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
          key={item.publicKey}
          loan={Loan.fromJSON(item)}
          onClick={() => router.push(`/loans/${item.publicKey}`)}
        />
      )}
    />
  );
};
