import type { NextPage } from "next";
import { Container, Heading } from "@chakra-ui/react";

import { LoanAsks, LoanOffers } from "../../components/tables";

const Loans: NextPage = () => {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" color="gray.200" size="md" mt="12" mb="12">
        Loan Listings
      </Heading>
      <LoanOffers />
      <LoanAsks />
    </Container>
  );
};

export default Loans;
