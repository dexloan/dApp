import { Icon, Flex, Text } from "@chakra-ui/react";
import { IoAtCircleOutline } from "react-icons/io5";

import * as utils from "../../common/utils";

interface VerifiedCollectionProps {
  symbol?: string;
  size?: "xs" | "sm" | "md";
}

export function VerifiedCollection({
  symbol,
  size = "sm",
}: VerifiedCollectionProps) {
  if (!symbol) return null;

  const title = utils.mapSymbolToCollectionTitle(symbol);

  if (!title) return null;

  return (
    <Flex direction="row" alignItems="center">
      <Icon as={IoAtCircleOutline} color="orange.300" mr="1" />
      <Text
        color="gray.500"
        fontSize={size}
        fontWeight="medium"
        // _groupHover={{ color: "orange.300", textDecoration: "underline" }}
      >
        {title}
      </Text>
    </Flex>
  );
}
