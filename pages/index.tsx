import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { useMemo } from "react";

import { CallOption, Loan } from "../common/model";
import { CallOptionCard, CardList, LoanCard } from "../components/card";
import { Masthead } from "../components/masthead";
import { useCallOptionsQuery, useLoansQuery } from "../hooks/query";

const Home: NextPage = () => {
  const loansQuery = useLoansQuery();
  const callOptionsQuery = useCallOptionsQuery();

  const loans = useMemo(
    () => loansQuery.data?.map(Loan.fromJSON) || [],
    [loansQuery.data]
  );

  const callOptions = useMemo(
    () => callOptionsQuery.data?.map(CallOption.fromJSON) || [],
    [callOptionsQuery.data]
  );

  return (
    <>
      <Head>
        <meta name="description" content="Free and secure NFT lending" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxW="container.xl">
        <Masthead />
        <Heading id="#listings" as="h2" color="gray.700" size="md" mb="6">
          Current listings
        </Heading>
        <Heading id="#listings" as="h3" color="gray.600" size="sm" mb="4">
          Loans
        </Heading>
        <CardList>
          {loans.map((l) => {
            return <LoanCard key={l.publicKey.toBase58()} loan={l} />;
          })}
        </CardList>
        {callOptions.length ? (
          <>
            <Heading id="#listings" as="h3" color="gray.600" size="sm" mb="4">
              Call Options
            </Heading>
            <CardList>
              {callOptions.map((c) => {
                return (
                  <CallOptionCard key={c.publicKey.toBase58()} callOption={c} />
                );
              })}
            </CardList>
          </>
        ) : null}
      </Container>
    </>
  );
};

export default Home;
