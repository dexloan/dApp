import type { NextPage } from "next";
import { useState } from "react";

import { useLoanOffersQuery } from "../../hooks/query";
import { LoanOffers } from "../../components/tables/loans";
import { LoanLayout } from "../../components/layout/loan";

const Offers: NextPage = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const offersQuery = useLoanOffersQuery({ collections });

  return (
    <LoanLayout setCollections={setCollections}>
      <LoanOffers heading="Offers" offers={offersQuery.data} />
    </LoanLayout>
  );
};

export default Offers;
