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
import { useHiresQuery } from "../../hooks/query";
import { HireCard, CardList } from "../../components/card";

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
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

const Listings = () => {
  const rentalsQuery = useHiresQuery();

  function renderCard(json: HirePretty) {
    const rental = Hire.fromJSON(json);

    return <HireCard key={rental.address} hire={rental} />;
  }

  return <CardList>{rentalsQuery.data?.map(renderCard)}</CardList>;
};

export default Rentals;
