import { Box, Heading, Flex, Text } from "@chakra-ui/react";
import { Detail } from "../detail";

type Attr = {
  trait_type: string;
  value: string;
};

interface AttributesProps {
  attributes?: Attr[];
}

export const Attributes = ({ attributes }: AttributesProps) => {
  if (attributes) {
    return (
      <Detail>
        <Heading color="gray.400" size="sm" mb="4">
          Attributes
        </Heading>
        <Flex flexWrap="wrap" gap="2">
          {attributes
            .filter((attr: Attr) => attr.value?.length)
            .map((attr: Attr) => (
              <Box
                key={attr.trait_type}
                borderRadius="sm"
                bgColor="rgba(0,0,0,0.2)"
                border="1px"
                borderColor="gray.800"
                maxW="100%"
                px="4"
                py="2"
              >
                <Text fontSize="sm">
                  <Text color="gray.500" size="xs">
                    {attr.trait_type}
                  </Text>
                  <Text>{attr.value}</Text>
                </Text>
              </Box>
            ))}
        </Flex>
      </Detail>
    );
  }

  return null;
};
