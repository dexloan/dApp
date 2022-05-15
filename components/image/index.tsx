import { Flex, Image, Box, Skeleton } from "@chakra-ui/react";
import { useMetadataFileQuery } from "../../hooks/query";

interface ListingImageProps {
  uri: string | undefined;
}

export function ListingImage({ uri }: ListingImageProps) {
  const metadataFileQuery = useMetadataFileQuery(uri);

  return (
    <Box w="100%" maxW="lg" borderRadius="lg" overflow="hidden">
      <Skeleton isLoaded={metadataFileQuery.isFetched}>
        <Image
          height="100%"
          width="100%"
          src={metadataFileQuery.data?.image}
          alt="NFT art image"
        />
      </Skeleton>
    </Box>
  );
}
