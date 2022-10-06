import { Heading, Flex, Text } from "@chakra-ui/react";
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
          {metadataFileQuery.data.attributes.map((attr: Attr) => (
            <Detail key={attr.trait_type} size="sm">
              <Text color="gray.500" size="xs">
                {attr.trait_type}
              </Text>
              <Text>{attr.value}</Text>
            </Detail>
          ))}
        </Flex>
      </Detail>
    );
  }

  return null;
};
