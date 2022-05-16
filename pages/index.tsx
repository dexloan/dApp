import type { NextPage } from "next";
import * as anchor from "@project-serum/anchor";
import { Badge, Box, Container, Flex, Heading } from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import Head from "next/head";

import * as utils from "../utils";
import { Card } from "../components/card";
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
        <Flex flexDirection="row" wrap="wrap" gap="1.25rem" mb="20">
          {listingsQuery.data?.map((item) => {
            if (
              item?.listing.publicKey &&
              item?.listing.account.basisPoints &&
              item?.metadata.data.uri &&
              item?.metadata.data.name
            ) {
              return (
                <Card
                  key={item?.listing.publicKey.toBase58()}
                  publicKey={item?.listing.publicKey}
                  uri={item?.metadata.data.uri}
                  imageAlt={item?.metadata.data.name}
                >
                  <Box p="4">
                    <Box display="flex" alignItems="baseline">
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        {item?.listing.account.basisPoints / 100}%
                      </Badge>
                      <Box
                        color="gray.500"
                        fontWeight="semibold"
                        letterSpacing="wide"
                        fontSize="xs"
                        textTransform="uppercase"
                        ml="2"
                      >
                        {utils.toMonths(
                          item?.listing.account.duration?.toNumber()
                        )}{" "}
                        months
                      </Box>
                    </Box>
                    <Box
                      mt="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated
                    >
                      {item?.metadata.data.name}
                    </Box>
                  </Box>
                  <Box p="4" bgColor="blue.50">
                    <Box fontWeight="bold" as="h3">
                      {item?.listing.account.amount.toNumber() /
                        anchor.web3.LAMPORTS_PER_SOL}
                      &nbsp;◎
                    </Box>
                  </Box>
                </Card>
              );
            }
            return null;
          })}
        </Flex>
      </Container>
    </>
  );
};

export default Home;
