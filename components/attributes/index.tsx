import { Box, Heading, Flex, Text } from "@chakra-ui/react";
import { useMetadataFileQuery } from "../../hooks/query";
import { Detail } from "../detail";

interface AttributesProps {
  uri?: string;
}

type Attr = {
  trait_type: string;
  value: string;
};

export const Attributes = ({ uri }: AttributesProps) => {
  const metadataFileQuery = useMetadataFileQuery(uri);

  if (metadataFileQuery.data?.attributes) {
    return (
      <Detail>
        <Heading color="gray.400" size="sm" mb="4">
          Attributes
        </Heading>
        <Flex flexWrap="wrap" gap="2">
          {metadataFileQuery.data.attributes
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
