import type { NextPage } from "next";
import { LoanState } from "@prisma/client";
import { Button, Icon } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { IoAdd } from "react-icons/io5";

import { useLoansQuery } from "../../hooks/query";
import { LoanListings, useLoanSortState } from "../../components/tables/loans";
import { AskLoanModal } from "../../components/form";
import { LoanLayout } from "../../components/layout/loan";

const Loans: NextPage = () => {
  const wallet = useWallet();
  const [loanModal, setLoanModal] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [sortState, sortBy] = useLoanSortState();
  const loansQuery = useLoansQuery({
    collections,
    state: LoanState.Listed,
    orderBy: sortState[0],
    sortOrder: sortState[1],
  });

  return (
    <>
      <LoanLayout setCollections={setCollections}>
        <LoanListings
          action={
            <Button
              size="sm"
              leftIcon={<Icon as={IoAdd} />}
              isDisabled={!wallet.publicKey}
              onClick={() => setLoanModal(true)}
            >
              Create Ask
            </Button>
          }
          heading="Asks"
          placeholderMessage="No asks currently"
          loans={loansQuery.data}
          isLoading={loansQuery.isLoading}
          sortState={sortState}
          onSort={sortBy}
        />
      </LoanLayout>
      <AskLoanModal
        open={loanModal}
        onRequestClose={() => setLoanModal(false)}
      />
    </>
  );
};

export default Loans;
