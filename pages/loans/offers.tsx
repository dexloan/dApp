import type { NextPage } from "next";
import { useState } from "react";

import { useGroupedLoanOffersQuery } from "../../hooks/query";
import { LoanOffers } from "../../components/tables/loans";
import { LoanLayout } from "../../components/layout/loan";

const Offers: NextPage = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const offersQuery = useGroupedLoanOffersQuery({ collections });

  return (
    <LoanLayout setCollections={setCollections}>
      <LoanOffers
        heading="Offers"
        offers={offersQuery.data}
        isLoading={offersQuery.isLoading}
      />
    </LoanLayout>
  );
};

export default Offers;
