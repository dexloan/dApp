import * as anchor from "@project-serum/anchor";
import { Badge, Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import * as utils from "../../utils";
import { CallOption } from "../../common/model";
import { useFloorPriceQuery, useMetadataFileQuery } from "../../hooks/query";
import { EllipsisProgress } from "../progress";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  uri: string;
  imageAlt: string;
  onClick?: () => void;
}

export const Card = ({ children, href, uri, imageAlt, onClick }: CardProps) => {
  const [isVisible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement & HTMLAnchorElement>(null);

  const metadataQuery = useMetadataFileQuery(uri);
  console.log("metadataQuery.data?.image: ", metadataQuery.data?.image);
  const card = (
    <Box
      as={href ? "a" : "button"}
      w={{
        base: "calc(50% - 0.625rem)",
        md: "calc(33.333% - 0.833rem)",
        lg: "calc(25% - 0.937rem)",
        xl: "calc(20% - 1rem)",
      }}
      borderWidth="1px"
      borderRadius="lg"
      cursor="pointer"
      overflow="hidden"
      tabIndex={1}
      ref={containerRef}
      _focus={{
        boxShadow: href || onClick ? "lg" : undefined,
      }}
      _hover={{
        boxShadow: href || onClick ? "md" : undefined,
      }}
      transition="box-shadow 0.2s ease-in"
      onClick={onClick}
    >
      <Box position="relative" width="100%" pb="100%">
        <Box position="absolute" left="0" top="0" right="0" bottom="0">
          <Skeleton
            height="100%"
            width="100%"
            isLoaded={metadataQuery.data?.image && isVisible}
          >
            {metadataQuery.data?.image && (
              <Image
                quality={100}
                layout="fill"
                objectFit="cover"
                src={metadataQuery.data?.image}
                alt={imageAlt}
                onLoad={() => setVisible(true)}
              />
            )}
          </Skeleton>
        </Box>
      </Box>

      {children}
    </Box>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
};

interface CardListProps {
  children: React.ReactNode;
}

export const CardList = ({ children }: CardListProps) => {
  return (
    <Flex flexDirection="row" wrap="wrap" gap="1.25rem" mb="20">
      {children}
    </Flex>
  );
};

interface LoanCardProps {
  amount: anchor.BN;
  basisPoints: number;
  duration: anchor.BN;
  name: string;
  symbol: string;
  uri: string;
  listing: anchor.web3.PublicKey;
}

export const LoanCard = ({
  amount,
  basisPoints,
  duration,
  name,
  symbol,
  uri,
  listing,
}: LoanCardProps) => {
  const floorPriceQuery = useFloorPriceQuery(symbol);
  const floorPrice = floorPriceQuery.data
    ? utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice))
    : null;

  return (
    <Card href={`/listing/${listing.toBase58()}`} uri={uri} imageAlt={name}>
      <Box p="4">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {basisPoints / 100}%
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {utils.formatDuration(duration)}
          </Box>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {name}
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {utils.formatAmount(amount)}{" "}
        </Box>
        <Text fontSize="xs" fontWeight="medium">
          Floor Price {floorPrice ?? <EllipsisProgress />}
        </Text>
      </Box>
    </Card>
  );
};

interface CallOptionCardProps {
  callOption: CallOption;
}

export const CallOptionCard = ({ callOption }: CallOptionCardProps) => {
  return (
    <Card
      href={`/option/${callOption.address}`}
      uri={callOption.metadata.data.uri}
      imageAlt={callOption.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {callOption.strikePrice}
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {callOption.expiry}
          </Box>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {callOption.metadata.data.name}
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {callOption.strikePrice}{" "}
        </Box>
        {/* <Text fontSize="xs" fontWeight="medium">
          Floor Price {floorPrice ?? <EllipsisProgress />}
        </Text> */}
      </Box>
    </Card>
  );
};
