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
        <Heading id="#listings" as="h2" color="gray.700" size="md" mb="4">
          Current listings
        </Heading>
        <CardList>
          {listingsQuery.data?.map((item) => {
            if (
              item?.publicKey &&
              item?.listing.basisPoints &&
              item?.metadata.data.uri &&
              item?.metadata.data.name
            ) {
              return (
                <ListedCard
                  key={item?.publicKey.toBase58()}
                  amount={item?.listing.amount}
                  basisPoints={item?.listing.basisPoints}
                  duration={item?.listing.duration}
                  uri={item?.metadata.data.uri}
                  name={item?.metadata.data.name}
                  symbol={item?.metadata.data.symbol}
                  listing={item?.publicKey}
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
