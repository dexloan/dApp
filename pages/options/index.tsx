import type { NextPage } from "next";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
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
import { IoAdd } from "react-icons/io5";
import { useMemo, useState } from "react";

import {
  useBuyerCallOptionsQuery,
  useCallOptionBidsByBuyerQuery,
  useCallOptionBidsQuery,
  useCallOptionsQuery,
  useSellerCallOptionsQuery,
} from "../../hooks/query";
import { SerializedCallOptionState } from "../../common/constants";
import { CallOptionListings, CallOptionBids } from "../../components/tables";
import { BidCallOptionModal } from "../../components/form";

const CallOptions: NextPage = () => {
  return (
    <Container maxW="container.lg">
      {/* <Heading as="h1" color="gray.200" size="sm" mt="12" mb="2">
        Call Options
      </Heading> */}

      <Tabs isLazy>
        <TabList mt="6">
          <Tab>Listings</Tab>
          <Tab>My Items</Tab>
        </TabList>
        <TabPanels my="6">
          <TabPanel>
            <Bids />
            <Asks />
          </TabPanel>
          <TabPanel>
            <YourBids />
            <YourAsks />
            <OptionsBought />
            <OptionsSold />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

const Bids = () => {
  const bidsQuery = useCallOptionBidsQuery();

  return <CallOptionBids heading="Bids" bids={bidsQuery.data} />;
};

const Asks = () => {
  const [optionModal, setOptionModal] = useState(false);
  const optionsQuery = useCallOptionsQuery(SerializedCallOptionState.Listed);

  return (
    <>
      <CallOptionListings
        action={
          <Button
            size="sm"
            leftIcon={<Icon as={IoAdd} />}
            onClick={() => setOptionModal(true)}
          >
            Create Ask
          </Button>
        }
        heading="Asks"
        placeholderMessage="No asks currently"
        callOptions={optionsQuery.data}
      />
      <BidCallOptionModal
        open={optionModal}
        onRequestClose={() => setOptionModal(false)}
      />
    </>
  );
};

const YourBids = () => {
  const anchorWallet = useAnchorWallet();
  const bidsQuery = useCallOptionBidsByBuyerQuery(anchorWallet?.publicKey);

  return <CallOptionBids heading="Your Bids" bids={bidsQuery.data} />;
};

const YourAsks = () => {
  const optionsQuery = useSellerCallOptionsQuery();
  const filteredOptions = useMemo(
    () => optionsQuery.data?.filter((option) => option.data.state === "listed"),
    [optionsQuery.data]
  );

  return (
    <CallOptionListings
      heading="Your Asks"
      placeholderMessage="You have no listed asks"
      callOptions={filteredOptions}
    />
  );
};

const OptionsBought = () => {
  const optionsQuery = useBuyerCallOptionsQuery();
  const filteredOptions = useMemo(
    () => optionsQuery.data?.filter((option) => option.data.state !== "listed"),
    [optionsQuery.data]
  );

  return (
    <CallOptionListings
      heading="Options Bought"
      placeholderMessage="No options bought"
      callOptions={filteredOptions}
    />
  );
};

const OptionsSold = () => {
  const optionsQuery = useSellerCallOptionsQuery();
  const filteredOptions = useMemo(
    () => optionsQuery.data?.filter((option) => option.data.state !== "listed"),
    [optionsQuery.data]
  );

  return (
    <CallOptionListings
      heading="Options Sold"
      placeholderMessage="No options sold"
      callOptions={filteredOptions}
    />
  );
};

export default CallOptions;
