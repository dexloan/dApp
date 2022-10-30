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

import { Hire, HirePretty } from "../../common/model";
import {
  useHiresQuery,
  useBorrowerHiresQuery,
  useLenderHiresQuery,
} from "../../hooks/query";
import { RentalCard, CardList } from "../../components/card";

const Rentals: NextPage = () => {
  return (
    <Container maxW="container.lg">
      <Tabs isLazy>
        <TabList mt="6">
          <Tab>Listings</Tab>
          <Tab>My Rentals</Tab>
        </TabList>
        <TabPanels my="6">
          <TabPanel>
            <Listings />
          </TabPanel>
          <TabPanel>
            <RentalsTaken />
            <RentalsGiven />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

function renderCard(json: HirePretty) {
  const rental = Hire.fromJSON(json);

  return <RentalCard key={rental.address} rental={rental} />;
}

const Listings = () => {
  const rentalsQuery = useHiresQuery();

  return (
    <>
      <CardList>{rentalsQuery.data?.map(renderCard)}</CardList>
    </>
  );
};

const RentalsTaken = () => {
  const rentalsQuery = useBorrowerHiresQuery();

  return <CardList>{rentalsQuery.data?.map(renderCard)}</CardList>;
};

const RentalsGiven = () => {
  const rentalsQuery = useLenderHiresQuery();

  return <CardList>{rentalsQuery.data?.map(renderCard)}</CardList>;
};

export default Rentals;
