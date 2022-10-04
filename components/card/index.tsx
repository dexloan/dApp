import * as anchor from "@project-serum/anchor";
import { Badge, Box, Heading, Flex, Skeleton, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { IoAlertCircle, IoCheckmark, IoLeaf } from "react-icons/io5";
import * as utils from "../../common/utils";
import { CallOption, Hire, Loan } from "../../common/model";
import { useFloorPriceQuery, useMetadataFileQuery } from "../../hooks/query";
import { EllipsisProgress } from "../progress";
import {
  CallOptionStateEnum,
  HireStateEnum,
  LoanStateEnum,
} from "../../common/types";

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
        // xl: "calc(20% - 1rem)",
      }}
      borderWidth="1px"
      borderColor="gray.800"
      borderRadius="md"
      cursor={href || onClick ? "pointer" : undefined}
      overflow="hidden"
      tabIndex={1}
      ref={containerRef}
      _focus={{
        boxShadow: href || onClick ? "lg" : undefined,
      }}
      _hover={{
        boxShadow: href || onClick ? "md" : undefined,
        transform: href || onClick ? "scale(1.02)" : undefined,
      }}
      transition="box-shadow 0.2s ease-in, transform 0.2s ease-in-out"
      onClick={onClick}
      role={onClick ? "button" : "link"}
    >
      <Box position="relative" width="100%" pb="80%">
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

  function renderBadge() {
    switch (loan.state) {
      case LoanStateEnum.Listed: {
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" bg="#ffb703">
            <IoLeaf />
          </Badge>
        );
      }

      case LoanStateEnum.Active:
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="blue">
            <IoCheckmark />
          </Badge>
        );

      default: {
        if (loan.expired) {
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
      href={`/loan/${loan.publicKey.toBase58()}`}
      uri={loan.metadata.data.uri}
      imageAlt={loan.metadata.data.name}
    >
      <Box p="4">
        <Box display="flex" alignItems="center">
          {renderBadge()}
          <Box
            color="gray.300"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            {loan.duration} ({loan.data.basisPoints / 100}% APY)
          </Box>
        </Box>
      </Box>
      <Box p="4">
        <Heading fontWeight="bold" fontSize="lg" as="span">
          {loan.amount}{" "}
        </Heading>
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
      case CallOptionStateEnum.Listed:
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="green">
            <IoLeaf />
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

        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="blue">
            <IoCheckmark />
          </Badge>
        );
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
        <Box mt="1">
          <Badge
            borderRadius="full"
            px="2"
            colorScheme="green"
            variant="subtle"
          >
            {callOption.cost} Premium
          </Badge>
        </Box>
      </Box>
      <Box p="4" bgColor="blue.50">
        <Box fontWeight="bold" as="h3">
          {callOption.strikePrice}{" "}
        </Box>
        <Text fontSize="xs" fontWeight="medium">
          Floor price {floorPrice}
        </Text>
      </Box>
    </Card>
  );
};

interface HireCardProps {
  hire: Hire;
}

export const HireCard = ({ hire }: HireCardProps) => {
  const floorPriceQuery = useFloorPriceQuery(hire.metadata.data.symbol);

  const floorPrice = useMemo(
    () =>
      floorPriceQuery.data
        ? utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice))
        : null,
    [floorPriceQuery.data]
  );

  function renderBadge() {
    switch (hire.state) {
      case HireStateEnum.Listed: {
        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="green">
            <IoLeaf />
          </Badge>
        );
      }

      default: {
        if (hire.expired) {
          return (
            <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="red">
              <IoAlertCircle />
            </Badge>
          );
        }

        if (hire.currentPeriodExpired) {
          return (
            <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="green">
              <IoLeaf />
            </Badge>
          );
        }

        return (
          <Badge borderRadius="full" px="1" py="1" mr="2" colorScheme="blue">
            <IoCheckmark />
          </Badge>
        );
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
            {hire.expiry}
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
          Floor Price {floorPrice}
        </Text>
      </Box>
    </Card>
  );
};
