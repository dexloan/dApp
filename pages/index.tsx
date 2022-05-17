import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import Head from "next/head";

import { CardList, ListedCard } from "../components/card";
import { Masthead } from "../components/masthead";
import { useListingsQuery } from "../hooks/query";

const Home: NextPage = () => {
  const { connection } = useConnection();
  const listingsQuery = useListingsQuery(connection);

  return (
    <>
      <Head>
        <meta name="description" content="Free and secure NFT lending" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxW="container.xl">
        <Masthead />
        <Heading as="h2" color="gray.700" size="md" mb="4">
          Current listings
        </Heading>
        <CardList>
          {listingsQuery.data?.map((item) => {
            if (
              item?.listing.publicKey &&
              item?.listing.account.basisPoints &&
              item?.metadata.data.uri &&
              item?.metadata.data.name
            ) {
              return (
                <ListedCard
                  key={item?.listing.publicKey.toBase58()}
                  amount={item?.listing.account.amount}
                  basisPoints={item?.listing.account.basisPoints}
                  duration={item?.listing.account.duration}
                  uri={item?.metadata.data.uri}
                  name={item?.metadata.data.name}
                  listing={item?.listing.publicKey}
                />
              );
            }
            return null;
          })}
        </CardList>
      </Container>
    </>
  );
};

export default Home;
