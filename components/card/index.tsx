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
        xl: "calc(20% - 1rem)",
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

interface HireCardProps {
  hire: Hire;
}

export const HireCard = ({ hire }: HireCardProps) => {
  function renderBadge() {
    switch (hire.state) {
      case HireStateEnum.Listed: {
        return null;
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
        </Box>
        <Box
          mt="1"
          fontSize="sm"
          fontWeight="medium"
          as="h5"
          lineHeight="tight"
          isTruncated
        >
          {hire.metadata.data.name}
        </Box>
        <Box
          display="flex"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
        >
          <Text fontWeight="semibold">{hire.amount}</Text> •{" "}
          <Text color="gray.500">{hire.expiry}</Text>
        </Box>
      </Box>
    </Card>
  );
};
