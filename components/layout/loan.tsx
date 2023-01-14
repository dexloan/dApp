import {
  Button,
  ButtonGroup,
  Box,
  Container,
  Flex,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { CollectionFilter } from "../../components/input/collection";

export const LoanLayout = ({
  children,
  setCollections,
}: {
  children: React.ReactNode;
  setCollections: (value: string[]) => void;
}) => {
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
        <Box flex={1}>{children}</Box>
      </Flex>
    </Container>
  );
};

export const LoanLinks = () => {
  const router = useRouter();

  return (
    <ButtonGroup isAttached size="sm" variant="outline">
      <NextLink href="/loans">
        <Button
          as="a"
          cursor="pointer"
          borderRightRadius="0"
          bgColor={router.pathname === "/loans" ? "gray.800" : undefined}
        >
          Asks
        </Button>
      </NextLink>
      <NextLink href="/loans/offers">
        <Button
          as="a"
          cursor="pointer"
          borderLeft="0"
          borderRight="0"
          borderRadius="0"
          bgColor={router.pathname === "/loans/offers" ? "gray.800" : undefined}
        >
          Offers
        </Button>
      </NextLink>
      <NextLink href="/loans/me">
        <Button
          as="a"
          cursor="pointer"
          borderLeftRadius="0"
          bgColor={router.pathname === "/loans/me" ? "gray.800" : undefined}
        >
          My Items
        </Button>
      </NextLink>
    </ButtonGroup>
  );
};
