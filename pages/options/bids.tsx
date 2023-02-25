import type { NextPage } from "next";
import { useState } from "react";

import { useGroupedCallOptionBidsQuery } from "../../hooks/query";
import { CallOptionBids } from "../../components/tables/callOptions";
import { CallOptionLayout } from "../../components/layout";

const Bids: NextPage = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const bidsQuery = useGroupedCallOptionBidsQuery({ collections });

  return (
    <CallOptionLayout setCollections={setCollections}>
      <CallOptionBids
        heading="Bids"
        bids={bidsQuery.data}
        isLoading={bidsQuery.isLoading}
      />
    </CallOptionLayout>
  );
};

export default Bids;
