import type { NextPage } from "next";
import NextLink from "next/link";
import {
  Button,
  ButtonGroup,
  Container,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useState, useMemo } from "react";
import { IoAdd } from "react-icons/io5";

import {
  useLoansQuery,
  useLoansTakenQuery,
  useLoansGivenQuery,
  useLoanOffersQuery,
  useLoanOffersByLenderQuery,
} from "../../hooks/query";
import { LoanListings, LoanOffers } from "../../components/tables/loans";
import { LoanLinks } from "../../components/buttons/loan";
import { AskLoanModal } from "../../components/form";
import { LoanState } from "@prisma/client";

const Offers = () => {
  return (
    <Container maxW="container.lg">
      <Box display="flex" justifyContent="flex-end" my="12">
        <LoanLinks />
      </Box>
    </Container>
  );
};

// const Offers = () => {
//   const offersQuery = useLoanOffersQuery();
//   return <LoanOffers heading="Offers" offers={offersQuery.data} />;
// };

export default Offers;
