import type { NextPage } from "next";
import { useState } from "react";

import { useGroupedLoanOffersQuery } from "../../hooks/query";
import { LoanOffers, useLoanSortState } from "../../components/tables/loans";
import { LoanLayout } from "../../components/layout/loan";

const Offers: NextPage = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [sortState, sortBy] = useLoanSortState();
  const offersQuery = useGroupedLoanOffersQuery({
    collections,
    orderBy: sortState[0],
    sortOrder: sortState[1],
  });

  return (
    <LoanLayout setCollections={setCollections}>
      <LoanOffers
        heading="Offers"
        offers={offersQuery.data}
        isLoading={offersQuery.isLoading}
        sortState={sortState}
        onSort={sortBy}
      />
    </LoanLayout>
  );
};

export default Offers;
