import * as anchor from "@project-serum/anchor";
import { Badge, Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import * as utils from "../../common/utils";
import { CallOption, Hire, Listing, Loan } from "../../common/model";
import { useFloorPriceQuery, useMetadataFileQuery } from "../../hooks/query";
import { EllipsisProgress } from "../progress";
import { CallOptionStateEnum, HireStateEnum } from "../../common/types";
import { IoAlertCircle, IoCheckmark, IoLeaf } from "react-icons/io5";

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

  const card = (
    <Box
      as={href ? "a" : "div"}
      w={{
        base: "calc(50% - 0.625rem)",
        md: "calc(33.333% - 0.833rem)",
        lg: "calc(25% - 0.937rem)",
        xl: "calc(20% - 1rem)",
      }}
      borderWidth="1px"
      borderRadius="lg"
      cursor={href || onClick ? "pointer" : undefined}
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
      role={onClick ? "button" : "link"}
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
    <Flex flexDirection="row" wrap="wrap" gap="1.25rem" mb="12">
      {children}
    </Flex>
  );
};

/**
 * Deprecated
 */

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const floorPriceQuery = useFloorPriceQuery(listing.metadata.data.symbol);
  const floorPrice = floorPriceQuery.data
    ? utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice))
    : null;

  return (
    <Card
      href={`/listing/${listing.publicKey.toBase58()}`}
      uri={listing.metadata.data.uri}
      imageAlt={listing.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {listing.data.basisPoints / 100}%
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {listing.duration}
          </Box>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {listing.metadata.data.name}
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {listing.amount}{" "}
        </Box>
        <Text fontSize="xs" fontWeight="medium">
          Floor Price {floorPrice ?? <EllipsisProgress />}
        </Text>
      </Box>
    </Card>
  );
};

interface LoanCardProps {
  loan: Loan;
}

export const LoanCard = ({ loan }: LoanCardProps) => {
  const floorPriceQuery = useFloorPriceQuery(loan.metadata.data.symbol);

  const floorPrice = useMemo(
    () =>
      floorPriceQuery.data
        ? utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice))
        : null,
    [floorPriceQuery.data]
  );

  return (
    <Card
      href={`/loan/${loan.publicKey.toBase58()}`}
      uri={loan.metadata.data.uri}
      imageAlt={loan.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {loan.data.basisPoints / 100}%
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {loan.duration}
          </Box>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {loan.metadata.data.name}
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {loan.amount}{" "}
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
  const floorPriceQuery = useFloorPriceQuery(callOption.metadata.data.symbol);

  const floorPrice = useMemo(
    () =>
      floorPriceQuery.data
        ? utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice))
        : null,
    [floorPriceQuery.data]
  );

  function renderBadge() {
    switch (callOption.state) {
      case CallOptionStateEnum.Active: {
        if (callOption.expired) {
          return (
            <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="red">
              <IoAlertCircle />
            </Badge>
          );
        }
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="green">
            <IoLeaf />
          </Badge>
        );
      }

      case CallOptionStateEnum.Exercised:
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="blue">
            <IoCheckmark />
          </Badge>
        );

      default: {
        if (callOption.expired) {
          return (
            <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="red">
              <IoAlertCircle />
            </Badge>
          );
        }
        return null;
      }
    }
  }

  return (
    <Card
      href={`/option/${callOption.address}`}
      uri={callOption.metadata.data.uri}
      imageAlt={callOption.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="center">
          {renderBadge()}
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
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
        <Text fontSize="xs" fontWeight="medium">
          Cost {callOption.cost}
        </Text>
      </Box>
    </Card>
  );
};

interface HireCardProps {
  hire: Hire;
}

export const HireCard = ({ hire }: HireCardProps) => {
  function renderBadge() {
    if (hire.expired) {
      return (
        <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="red">
          <IoAlertCircle />
        </Badge>
      );
    }

    switch (hire.state) {
      case HireStateEnum.Listed: {
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="green">
            <IoLeaf />
          </Badge>
        );
      }

      case HireStateEnum.Hired: {
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="blue">
            <IoCheckmark />
          </Badge>
        );
      }

      default: {
        return null;
      }
    }
  }

  return (
    <Card
      href={`/rental/${hire.address}`}
      uri={hire.metadata.data.uri}
      imageAlt={hire.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="center">
          {renderBadge()}
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            Expires {hire.expiry}
          </Box>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {hire.metadata.data.name}
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {hire.amount}
        </Box>
        <Text fontSize="xs" fontWeight="medium">
          Daily cost
        </Text>
      </Box>
    </Card>
  );
};
