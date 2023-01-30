import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Box, Container, Heading, Flex, Text } from "@chakra-ui/react";

import { CollectionJson } from "../../common/types";
import { Activity } from "../activity";
import { Attributes } from "../attributes";
import { Detail } from "../detail";
import { ExternalLinks } from "../link";
import { ListingImage } from "../image";
import { VerifiedCollection } from "../collection";

type Stat = {
  label: string;
  value?: string | React.ReactNode;
};

interface NftLayoutProps {
  mint?: string;
  metadataJson?: any;
  collection?: CollectionJson;
  action?: React.ReactNode;
  stats?: Stat[][];
}

export const NftLayout = ({
  mint,
  metadataJson,
  collection,
  action,
  stats = [],
}: NftLayoutProps) => {
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
          <ListingImage src={metadataJson?.image} />
          <ExternalLinks mint={mint} />
          <Box mb="6">
            <Attributes attributes={metadataJson.attributes} />
          </Box>
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }}>
          {/* <Badge colorScheme="orange" mb="2">
          Peer-to-peer Loan
        </Badge> */}

          <Detail>
            <Heading as="h1" size="md" color="gray.200" fontWeight="black">
              {metadataJson?.name}
            </Heading>
            <Box mb="8">
              <VerifiedCollection name={collection?.name ?? undefined} />
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

          <Activity mint={mint} />
        </Box>
      </Flex>
    </Container>
  );
};
