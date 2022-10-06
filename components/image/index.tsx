import { Image, Box, Fade, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useMetadataFileQuery } from "../../hooks/query";

interface ListingImageProps {
  uri: string | undefined;
}

export function ListingImage({ uri }: ListingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const metadataFileQuery = useMetadataFileQuery(uri);

  useEffect(() => {
    if (metadataFileQuery.data) {
      const src = metadataFileQuery.data.image;
      const img = document.createElement("img");

      img.onload = () => {
        setLoaded(true);
      };

      img.src = src;
    }
  }, [metadataFileQuery.data]);

  return (
    <Box
      position="relative"
      w="md"
      maxW="100%"
      borderRadius="sm"
      overflow="hidden"
    >
      <Skeleton w="100%" isLoaded={loaded}>
        {loaded ? null : <Box pb="100%" />}
        <Image
          height="100%"
          width="100%"
          borderRadius="lg"
          src={metadataFileQuery.data?.image}
          alt="NFT art"
        />
      </Skeleton>
    </Box>
  );
}
