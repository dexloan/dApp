import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";
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

  return (
    <>
      <Container maxW="container.lg">
        <Masthead />
      </Container>
    </>
  );
};

export default Home;
