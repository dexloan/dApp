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

const YourOffers = () => {
  const anchorWallet = useAnchorWallet();
  const offersQuery = useLoanOffersByLenderQuery(anchorWallet?.publicKey);

  return <LoanOffers heading="Your Offers" offers={offersQuery.data} />;
};

const LoansGiven = () => {
  const loansQuery = useLoansGivenQuery();

  return (
    <LoanListings
      heading="Loans Given"
      placeholderMessage="No active loans"
      // loans={loansQuery.data}
    />
  );
};

const LoansTaken = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state !== "Listed"),
    [loansQuery.data]
  );

  return (
    <LoanListings
      heading="Loans Taken"
      placeholderMessage="No active loans"
      // loans={filteredLoans}
    />
  );
};

const LoanAsks = () => {
  const loansQuery = useLoansTakenQuery();
  const filteredLoans = useMemo(
    () => loansQuery.data?.filter((loan) => loan.data.state === "Listed"),
    [loansQuery.data]
  );

  return (
    <LoanListings
      heading="Your Asks"
      placeholderMessage="You have no listed asks"
      // loans={filteredLoans}
    />
  );
};
