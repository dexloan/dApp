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

export const CallOptionLayout = ({
  children,
  setCollections,
}: {
  children: React.ReactNode;
  setCollections: (value: string[]) => void;
}) => {
  return (
    <Container maxW="container.xl">
      <Box display="flex" justifyContent="flex-end" my="12">
        <CallOptionLinks />
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

export const CallOptionLinks = () => {
  const router = useRouter();

  return (
    <ButtonGroup isAttached size="sm" variant="outline">
      <NextLink href="/options">
        <Button
          as="a"
          cursor="pointer"
          borderRightRadius="0"
          bgColor={router.pathname === "/options" ? "gray.800" : undefined}
        >
          Asks
        </Button>
      </NextLink>
      <NextLink href="/options/bids">
        <Button
          as="a"
          cursor="pointer"
          borderLeft="0"
          borderRight="0"
          borderRadius="0"
          bgColor={router.pathname === "/options/bids" ? "gray.800" : undefined}
        >
          Bids
        </Button>
      </NextLink>
      <NextLink href="/options/me">
        <Button
          as="a"
          cursor="pointer"
          borderLeftRadius="0"
          bgColor={router.pathname === "/options/me" ? "gray.800" : undefined}
        >
          My Items
        </Button>
      </NextLink>
    </ButtonGroup>
  );
};
