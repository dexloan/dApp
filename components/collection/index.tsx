import { Icon, Flex, Text } from "@chakra-ui/react";
import { IoAtCircleOutline } from "react-icons/io5";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import { useCollectionName } from "../../hooks/render";

interface VerifiedCollectionProps {
  metadata?: Metadata;
  size?: "xs" | "sm" | "md";
}

export function VerifiedCollection({
  metadata,
  size = "sm",
}: VerifiedCollectionProps) {
  const collectionName = useCollectionName(metadata);

  if (!metadata?.collection?.key) {
    return null;
  }

  return (
    <Flex direction="row" alignItems="center">
      <Icon as={IoAtCircleOutline} color="orange.300" mr="1" />
      <Text
        color="gray.500"
        fontSize={size}
        fontWeight="medium"
        // _groupHover={{ color: "orange.300", textDecoration: "underline" }}
      >
        {collectionName ?? "..."}
      </Text>
    </Flex>
  );
}
