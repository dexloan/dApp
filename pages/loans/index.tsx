import type { NextPage } from "next";
import { Button, Box, Container, Flex, Icon, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { IoAdd } from "react-icons/io5";

import { useLoansQuery } from "../../hooks/query";
import { LoanListings } from "../../components/tables/loans";
import { LoanLinks } from "../../components/buttons/loan";
import { CollectionFilter } from "../../components/input/collection";
import { AskLoanModal } from "../../components/form";
import { LoanState } from "@prisma/client";

const Loans: NextPage = () => {
  const wallet = useWallet();
  const [loanModal, setLoanModal] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const loansQuery = useLoansQuery({
    state: LoanState.Listed,
    collections,
  });

  return (
    <Container maxW="container.xl">
      <Box display="flex" justifyContent="flex-end" my="12">
        <LoanLinks />
      </Box>
      <Flex gap="16">
        <Box flex={0} flexBasis="60" maxWidth="60">
          <Text size="sm" fontWeight="semibold" mb="6">
            Collections
          </Text>
          <CollectionFilter onChange={(value) => setCollections(value ?? [])} />
        </Box>
        <Box flex={1}>
          <LoanListings
            action={
              <Button
                size="sm"
                leftIcon={<Icon as={IoAdd} />}
                isDisabled={!wallet.publicKey}
                onClick={() => setLoanModal(true)}
              >
                Create Ask
              </Button>
            }
            heading="Asks"
            placeholderMessage="No asks currently"
            loans={loansQuery.data}
            isLoading={loansQuery.isLoading}
          />
        </Box>
      </Flex>
      <AskLoanModal
        open={loanModal}
        onRequestClose={() => setLoanModal(false)}
      />
    </Container>
  );
};

export default Loans;
