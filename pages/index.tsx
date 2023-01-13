import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
import { useMemo } from "react";

import { CallOption, Rental, Loan } from "../common/model";
import {
  CallOptionCard,
  CardList,
  RentalCard,
  LoanCard,
} from "../components/card";
import { Masthead } from "../components/masthead";
import {
  useCallOptionsQuery,
  useRentalsQuery,
  useLoansQuery,
} from "../hooks/query";
import { CallOptionStateEnum, LoanState } from "../common/types";

const Home: NextPage = () => {
  const loansQuery = useLoansQuery();
  const callOptionsQuery = useCallOptionsQuery();
  const hiresQuery = useRentalsQuery();

  return (
    <>
      <Container maxW="container.lg">
        <Masthead />
      </Container>
    </>
  );
};

export default Home;
