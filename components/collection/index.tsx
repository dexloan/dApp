import { Box, Icon, Flex, Text } from "@chakra-ui/react";
import { IoShieldCheckmark } from "react-icons/io5";

interface VerifiedCollectionProps {
  symbol?: string;
}

export function VerifiedCollection({ symbol }: VerifiedCollectionProps) {
  return (
    <Flex direction="row" alignItems="center" mb="8">
      <Icon as={IoShieldCheckmark} color="green.500" mr="1" />
      <Text size="md" fontWeight="medium">
        Chicken Tribe
      </Text>
    </Flex>
  );
}
