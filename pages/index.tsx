import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { useMemo } from "react";

import { CallOption, Hire, Loan } from "../common/model";
import {
  CallOptionCard,
  CardList,
  HireCard,
  LoanCard,
} from "../components/card";
import { Masthead } from "../components/masthead";
import {
  useCallOptionsQuery,
  useHiresQuery,
  useLoansQuery,
} from "../hooks/query";
import { CallOptionStateEnum, LoanStateEnum } from "../common/types";

const Home: NextPage = () => {
  const loansQuery = useLoansQuery();
  const callOptionsQuery = useCallOptionsQuery();
  const hiresQuery = useHiresQuery();

  const loans = useMemo(
    () =>
      (loansQuery.data?.map(Loan.fromJSON) || []).filter(
        (loan) => loan.state !== LoanStateEnum.Defaulted
      ),
    [loansQuery.data]
  );

  const callOptions = useMemo(
    () =>
      (callOptionsQuery.data?.map(CallOption.fromJSON) || []).filter(
        (callOption) => callOption.state !== CallOptionStateEnum.Exercised
      ),
    [callOptionsQuery.data]
  );

  console.log(callOptions);

  const hires = useMemo(
    () => hiresQuery.data?.map(Hire.fromJSON) || [],
    [hiresQuery.data]
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

        {hires.length ? (
          <>
            <Heading id="#listings" as="h3" color="gray.600" size="sm" mb="4">
              Rentals
            </Heading>
            <CardList>
              {hires.map((h) => {
                return <HireCard key={h.publicKey.toBase58()} hire={h} />;
              })}
            </CardList>
          </>
        ) : null}
      </Container>
    </>
  );
};

export default Home;
