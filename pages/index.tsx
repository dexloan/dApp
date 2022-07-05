import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { useMemo } from "react";

import { Loan } from "../common/model";
import { CardList, LoanCard } from "../components/card";
import { Masthead } from "../components/masthead";
import { useLoansQuery } from "../hooks/query";

const Home: NextPage = () => {
  const loansQuery = useLoansQuery();

  const loans = useMemo(
    () => loansQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [loansQuery.data]
  );

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
          {loans.map((l) => {
            return <LoanCard key={l.publicKey.toBase58()} loan={l} />;
          })}
        </CardList>
      </Container>
    </>
  );
};

export default Home;
