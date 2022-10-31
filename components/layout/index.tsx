import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Box, Container, Heading, Flex, Text } from "@chakra-ui/react";

import { Activity } from "../activity";
import { Attributes } from "../attributes";
import { Detail } from "../detail";
import { ExternalLinks } from "../link";
import { ListingImage } from "../image";
import { VerifiedCollection } from "../collection";

export const Main = ({ children }: { children: React.ReactNode }) => {
  return <Container maxW="container.xl">{children}</Container>;
};

export const Well = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box p="4" borderColor="gray.200" borderWidth={1} borderRadius="md">
      {children}
    </Box>
  );
};

type Stat = {
  label: string;
  value?: string | JSX.Element;
};

interface NftLayoutProps {
  metadata?: Metadata;
  action?: React.ReactNode;
  stats?: Stat[][];
}

export const NftLayout = ({ metadata, action, stats = [] }: NftLayoutProps) => {
  return (
    <Container maxW={{ md: "container.md", lg: "container.lg" }}>
      <Flex
        direction={{
          base: "column",
          lg: "row",
        }}
        align={{
          base: "center",
          lg: "flex-start",
        }}
        wrap="wrap"
        pt="9"
      >
        <Box
          flex={0}
          w={{ base: "100%", lg: "auto" }}
          maxW={{ base: "xl", lg: "100%" }}
        >
          <ListingImage uri={metadata?.data.uri} />
          <ExternalLinks mint={metadata?.mint} />
          <Box mb="6">
            <Attributes uri={metadata?.data.uri} />
          </Box>
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }}>
          {/* <Badge colorScheme="orange" mb="2">
          Peer-to-peer Loan
        </Badge> */}

          <Detail>
            <Heading as="h1" size="md" color="gray.200" fontWeight="black">
              {metadata?.data.name}
            </Heading>
            <Box mb="8">
              <VerifiedCollection metadata={metadata} />
            </Box>
            {stats.map((row, index) => (
              <Flex key={index} direction="row" gap="12" mt="6">
                {row.map((stat) => (
                  <Box key={stat.label}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.500">
                      {stat.label}
                    </Text>
                    <Heading size="md" fontWeight="bold" mb="6">
                      {stat.value}
                    </Heading>
                  </Box>
                ))}
              </Flex>
            ))}
            {action}
          </Detail>

          <Activity mint={metadata?.mint} />
        </Box>
      </Flex>
    </Container>
  );
};
