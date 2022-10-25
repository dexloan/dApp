import type { NextPage } from "next";
import {
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { CallOption } from "../../common/model";
import { useCallOptionBidsQuery, useCallOptionsQuery } from "../../hooks/query";
import { ColumnHeader, NFTCell } from "../../components/table";
import {
  useCallOptionSortState,
  useSortedCallOptions,
} from "../../components/tables/callOptions/common";

const CallOptions: NextPage = () => {
  const [[sortCol, direction], setSortBy] = useState<[SortCols, number]>([
    "expiry",
    1,
  ]);

  const callOptionsQuery = useCallOptionsQuery();
  const callOptions = useMemo(
    () =>
      (callOptionsQuery.data?.map(CallOption.fromJSON) || []).sort(
        compareBy(sortCol, direction)
      ),
    [callOptionsQuery.data, sortCol, direction]
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
      {/* <Heading as="h1" color="gray.200" size="sm" mt="12" mb="2">
        Call Options
      </Heading> */}
      <Container maxW="container.lg">
        {/* <Heading as="h1" color="gray.200" size="md" mt="12" mb="12">
        Loans
      </Heading> */}
        <Tabs isLazy>
          <TabList mt="6">
            <Tab>Listings</Tab>
            <Tab>My Items</Tab>
          </TabList>
          <TabPanels my="6">
            <TabPanel>
              <Bids />
              <Listings />
            </TabPanel>
            <TabPanel>
              <YourOffers />
              <LoanAsks />
              <LoansTaken />
              <LoansGiven />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Container>
  );
};

const Bids = () => {
  const offersQuery = useCallOptionBidsQuery();
  const [sortState, onSort] = useCallOptionSortState();
  const sortedOffers = useSortedCallOptions(offersQuery.data, sortState);

  return (
    <CallOptionBids
      heading="Offers"
      offers={sortedOffers}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

const Listings = () => {
  const [loanModal, setLoanModal] = useState(false);
  const loansQuery = useLoansQuery(SerializedLoanState.Listed);
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(loansQuery.data, sortState);

  return (
    <>
      <LoanListings
        action={
          <Button
            size="sm"
            leftIcon={<Icon as={IoAdd} />}
            onClick={() => setLoanModal(true)}
          >
            Create Ask
          </Button>
        }
        heading="Asks"
        placeholderMessage="No asks currently"
        loans={sortedLoans}
        sortCol={sortState[0]}
        direction={sortState[1]}
        onSort={onSort}
      />
      <AskLoanModal
        open={loanModal}
        onRequestClose={() => setLoanModal(false)}
      />
    </>
  );
};

const YourOffers = () => {
  const anchorWallet = useAnchorWallet();
  const myOffersQuery = useLoanOffersByLenderQuery(anchorWallet?.publicKey);
  const [sortState, onSort] = useLoanSortState();
  const sortedOffers = useSortedLoanOffers(myOffersQuery.data, sortState);

  return (
    <LoanOffers
      heading="Your Offers"
      offers={sortedOffers}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

const LoansGiven = () => {
  const loansQuery = useLoansGivenQuery();
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(loansQuery.data, sortState);

  return (
    <LoanListings
      heading="Loans Given"
      placeholderMessage="No active loans"
      loans={sortedLoans}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

const LoansTaken = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state !== "listed"),
    [loansQuery.data]
  );
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(filteredLoans, sortState);

  return (
    <LoanListings
      heading="Loans Taken"
      placeholderMessage="No active loans"
      loans={sortedLoans}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

const LoanAsks = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state === "listed"),
    [loansQuery.data]
  );
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(filteredLoans, sortState);

  return (
    <LoanListings
      heading="Your Asks"
      placeholderMessage="You have no listed asks"
      loans={sortedLoans}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

export default CallOptions;
