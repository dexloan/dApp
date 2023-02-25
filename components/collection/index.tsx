import { Icon, Flex, Text } from "@chakra-ui/react";
import { IoAtCircleOutline } from "react-icons/io5";

interface VerifiedCollectionProps {
  name?: string;
  size?: "xs" | "sm" | "md";
}

export function VerifiedCollection({
  name,
  size = "sm",
}: VerifiedCollectionProps) {
  return (
    <Flex direction="row" alignItems="center">
      <Icon as={IoAtCircleOutline} color="orange.300" mr="1" />
      <Text
        color="gray.500"
        fontSize={size}
        fontWeight="medium"
        // _groupHover={{ color: "orange.300", textDecoration: "underline" }}
      >
        {name ?? "..."}
      </Text>
    </Flex>
  );
}
