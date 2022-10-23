import type { NextPage } from "next";
import {
  Button,
  Container,
  Heading,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { IoAdd } from "react-icons/io5";

import { SerializedLoanState } from "../../common/constants";
import {
  useLoansQuery,
  useLoansTakenQuery,
  useLoansGivenQuery,
  useLoanOffersQuery,
  useLoanOffersByLenderQuery,
} from "../../hooks/query";
import {
  LoanListings,
  LoanOffers,
  useLoanSortState,
  useSortedLoans,
  useSortedLoanOffers,
} from "../../components/tables";
import { AskLoanModal } from "../../components/form";

const Loans: NextPage = () => {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" color="gray.200" size="md" mt="12" mb="12">
        Loans
      </Heading>
      <Tabs>
        <TabList>
          <Tab>Listings</Tab>
          <Tab>My Items</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Offers />
            <Listings />
          </TabPanel>
          <TabPanel>
            <YourOffers />
            <LoansGiven />
            <LoansTaken />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

const Offers = () => {
  const offersQuery = useLoanOffersQuery();
  const [sortState, onSort] = useLoanSortState();
  const sortedOffers = useSortedLoanOffers(offersQuery.data, sortState);

  return (
    <LoanOffers
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
      heading="Offers Made"
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
      loans={sortedLoans}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

const LoansTaken = () => {
  const loansQuery = useLoansTakenQuery();
  const [sortState, onSort] = useLoanSortState();
  const sortedLoans = useSortedLoans(loansQuery.data, sortState);

  return (
    <LoanListings
      heading="Loans Taken"
      loans={sortedLoans}
      sortCol={sortState[0]}
      direction={sortState[1]}
      onSort={onSort}
    />
  );
};

export default Loans;
