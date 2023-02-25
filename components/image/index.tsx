import { Image, Box, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ListingImageProps {
  src: string | undefined;
}

export function ListingImage({ src }: ListingImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      const img = document.createElement("img");

      img.onload = () => {
        setLoaded(true);
      };

      img.src = src;
    }
  }, [src]);

  return (
    <Box
      position="relative"
      w="md"
      maxW="100%"
      borderRadius="sm"
      overflow="hidden"
      sx={{
        aspectRatio: loaded ? undefined : "1",
      }}
    >
      <Skeleton w="100%" isLoaded={loaded}>
        {loaded ? null : <Box pb="100%" />}
        <Image
          height="100%"
          width="100%"
          borderRadius="sm"
          src={src}
          alt="NFT art"
        />
      </Skeleton>
    </Box>
  );
}
