import type { NextPage } from "next";
import {
  Button,
  Container,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useState, useMemo } from "react";
import { IoAdd } from "react-icons/io5";

import { SerializedLoanState } from "../../common/constants";
import {
  useLoansQuery,
  useLoansTakenQuery,
  useLoansGivenQuery,
  useLoanOffersQuery,
  useLoanOffersByLenderQuery,
} from "../../hooks/query";
import { LoanListings, LoanOffers } from "../../components/tables/loans";
import { AskLoanModal } from "../../components/form";

const Loans: NextPage = () => {
  const wallet = useWallet();

  return (
    <Container maxW="container.lg">
      {/* <Heading as="h1" color="gray.200" size="md" mt="12" mb="12">
        Loans
      </Heading> */}
      <Tabs isLazy>
        <TabList mt="6">
          <Tab>Listings</Tab>
          <Tab isDisabled={!wallet.publicKey}>My Loans</Tab>
        </TabList>
        <TabPanels my="6">
          <TabPanel>
            <Offers />
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
  );
};

const Offers = () => {
  const offersQuery = useLoanOffersQuery();

  return <LoanOffers heading="Offers" offers={offersQuery.data} />;
};

const Listings = () => {
  const [loanModal, setLoanModal] = useState(false);
  const loansQuery = useLoansQuery(SerializedLoanState.Listed);

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
        loans={loansQuery.data}
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
  const offersQuery = useLoanOffersByLenderQuery(anchorWallet?.publicKey);

  return <LoanOffers heading="Your Offers" offers={offersQuery.data} />;
};

const LoansGiven = () => {
  const loansQuery = useLoansGivenQuery();

  return (
    <LoanListings
      heading="Loans Given"
      placeholderMessage="No active loans"
      loans={loansQuery.data}
    />
  );
};

const LoansTaken = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state !== "listed"),
    [loansQuery.data]
  );

  return (
    <LoanListings
      heading="Loans Taken"
      placeholderMessage="No active loans"
      loans={filteredLoans}
    />
  );
};

const LoanAsks = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state === "listed"),
    [loansQuery.data]
  );

  return (
    <LoanListings
      heading="Your Asks"
      placeholderMessage="You have no listed asks"
      loans={filteredLoans}
    />
  );
};

export default Loans;
