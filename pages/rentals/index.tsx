import type { NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from "@chakra-ui/react";

import { Rental, RentalPretty } from "../../common/model";
import {
  useRentalsQuery,
  useRentalsTakenQuery,
  useLenderRentalsQuery,
} from "../../hooks/query";
import { RentalCard, CardList } from "../../components/card";
import { EmptyMessage } from "../../components/table";
import { useState } from "react";
import { OfferRentalModal } from "../../components/form/offerRental";

const Rentals: NextPage = () => {
  const wallet = useWallet();

  return (
    <Container maxW="container.lg">
      <Tabs isLazy>
        <TabList mt="6">
          <Tab>Listings</Tab>
          <Tab isDisabled={!wallet.publicKey}>My Rentals</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Listings />
          </TabPanel>
          <TabPanel>
            <MyRentals />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

function renderCard(json: RentalPretty) {
  const rental = Rental.fromJSON(json);

  return <RentalCard key={rental.address} rental={rental} />;
}

const Actions = () => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Box display="flex" w="100%" justifyContent="flex-end">
        <Button size="sm" onClick={() => setModal(true)}>
          Offer Rental
        </Button>
      </Box>
      <OfferRentalModal open={modal} onRequestClose={() => setModal(false)} />
    </>
  );
};

const Listings = () => {
  const rentalsQuery = useRentalsQuery();

  function renderListings() {
    if (rentalsQuery.isLoading) {
      return (
        <Box d="flex" w="100%" p="12" justifyContent="center">
          <Spinner />
        </Box>
      );
    }

    if (!rentalsQuery.data?.length) {
      return <EmptyMessage>No active listings</EmptyMessage>;
    }

    return <CardList>{rentalsQuery.data?.map(renderCard)}</CardList>;
  }

  return (
    <>
      <Actions />
      <Heading
        fontSize="xs"
        color="gray.400"
        fontWeight="medium"
        letterSpacing="wider"
        lineHeight="4"
        mb="4"
      >
        Listings
      </Heading>
      {renderListings()}
    </>
  );
};

const MyRentals = () => {
  const lenderQuery = useLenderRentalsQuery();
  const rentalsTakenQuery = useRentalsTakenQuery();

  function renderLists() {
    if (lenderQuery.isLoading || rentalsTakenQuery.isLoading) {
      return (
        <Box d="flex" w="100%" p="12" justifyContent="center">
          <Spinner />
        </Box>
      );
    }

    if (!lenderQuery.data?.length && !rentalsTakenQuery.data?.length) {
      return <EmptyMessage>No active rentals</EmptyMessage>;
    }

    return (
      <>
        {lenderQuery.data?.length ? (
          <>
            <Heading
              fontSize="xs"
              color="gray.400"
              fontWeight="medium"
              letterSpacing="wider"
              lineHeight="4"
              mb="4"
            >
              Lending
            </Heading>
            <CardList>{lenderQuery.data?.map(renderCard)}</CardList>
          </>
        ) : null}

        {rentalsTakenQuery.data?.length ? (
          <>
            <Heading
              fontSize="xs"
              color="gray.400"
              fontWeight="medium"
              letterSpacing="wider"
              lineHeight="4"
              mb="4"
            >
              Renting
            </Heading>
            <CardList>{rentalsTakenQuery.data?.map(renderCard)}</CardList>
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Actions />
      {renderLists()}
    </>
  );
};

export default Rentals;
