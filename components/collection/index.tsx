import { Icon, Flex, Text } from "@chakra-ui/react";
import { IoShieldCheckmark } from "react-icons/io5";

import * as utils from "../../utils";

interface VerifiedCollectionProps {
  symbol?: string;
  size?: "xs" | "sm" | "md";
}

export function VerifiedCollection({
  symbol,
  size = "md",
}: VerifiedCollectionProps) {
  return (
    <Flex direction="row" alignItems="center">
      <Icon as={IoShieldCheckmark} color="green.500" mr="1" />
      <Text color="gray.500" fontSize={size} fontWeight="medium">
        {symbol ? utils.mapSymbolToCollectionTitle(symbol) : ""}
      </Text>
    </Flex>
  );
}
