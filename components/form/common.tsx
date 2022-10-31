import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState, useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Box,
  Heading,
  Flex,
  FormLabel,
  ModalBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Skeleton,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import Image from "next/image";

import * as utils from "../../common/utils";
import dayjs from "../../common/lib/dayjs";
import { NftResult, CollectionItem, CollectionMap } from "../../common/types";
import {
  useNftByOwnerQuery,
  useFloorPriceQuery,
  useMetadataFileQuery,
  useMetadata,
} from "../../hooks/query";
import { Card, CardList } from "../card";
import { VerifiedCollection } from "../collection";
import { EllipsisProgress } from "../progress";

export interface ModalProps {
  open: boolean;
  onRequestClose: () => void;
}

export interface LoanFormFields {
  ltv: number;
  apy: number;
  duration: number;
}

export interface CallOptionFormFields {
  amount: number;
  strikePrice: number;
  expiry: number;
}

interface LoanForecastProps {
  amountLabel?: string;
  duration?: anchor.BN;
  amount?: anchor.BN | null;
  basisPoints?: number;
}

export const LoanForecast = ({
  amount,
  amountLabel = "Borrowing",
  duration,
  basisPoints,
}: LoanForecastProps) => {
  const interest = useMemo(() => {
    if (amount && basisPoints && duration) {
      return utils.calculateInterestOnMaturity(amount, duration, basisPoints);
    }
  }, [amount, duration, basisPoints]);

  const days = useMemo(() => {
    if (duration) {
      return duration.toNumber() / 86_400;
    }
  }, [duration]);

  return (
    <Flex direction="column" gap="2" justify="space-between">
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500">
          {amountLabel}
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {amount ? utils.formatAmount(amount) : <EllipsisProgress />}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Interest on Maturity
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {interest ? utils.formatAmount(interest) : <EllipsisProgress />}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Duration
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {days} days
        </Text>
      </Flex>
    </Flex>
  );
};

interface CallOptionDetailsProps {
  amount?: anchor.BN;
  strikePrice?: anchor.BN;
  expiry?: anchor.BN;
}

export const CallOptionDetails = ({
  amount,
  strikePrice,
  expiry,
}: CallOptionDetailsProps) => {
  return (
    <Flex direction="column" gap="2" justify="space-between">
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500">
          Cost
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {amount ? utils.formatAmount(amount) : <EllipsisProgress />}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Expires
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {expiry ? (
            dayjs.unix(expiry.toNumber()).format("DD/MM/YYYY")
          ) : (
            <EllipsisProgress />
          )}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Strike Price
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {strikePrice ? utils.formatAmount(strikePrice) : <EllipsisProgress />}
        </Text>
      </Flex>
    </Flex>
  );
};

type UnitGetter = (value: number) => string;

interface FormFieldProps<Fields extends FieldValues> {
  name: Path<Fields>;
  control: Control<Fields, any>;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  icon: IconType;
  units: string | UnitGetter;
}

export const SliderField = <Fields extends FieldValues>({
  name,
  control,
  label,
  defaultValue,
  min,
  max,
  step,
  icon,
  units,
}: FormFieldProps<Fields>) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box pb="6">
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        rules={{
          required: true,
        }}
        render={({ field: { value, onChange } }) => (
          <Slider
            id={name}
            aria-label={label}
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={step}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onChange={(value) => onChange(value)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              placement="top"
              isOpen={showTooltip}
              label={`${value} ${
                typeof units === "function" ? units(value) : units
              }`}
            >
              <SliderThumb boxSize={6}>
                <Box color="gray.900" as={icon} />
              </SliderThumb>
            </Tooltip>
          </Slider>
        )}
      />
    </Box>
  );
};

interface SelectNftFormProps {
  collectionMint?: anchor.web3.PublicKey;
  onSelect: (selected: NftResult) => void;
}

export const SelectNftForm = ({
  collectionMint,
  onSelect,
}: SelectNftFormProps) => {
  const wallet = useAnchorWallet();
  const collectionQuery = useMetadata(collectionMint);
  const nftQuery = useNftByOwnerQuery(wallet);

  const collections = useMemo(() => {
    const collectionMap = nftQuery.data
      ?.filter((nft) => {
        if (collectionMint) {
          return (
            nft.metadata.collection?.verified &&
            nft.metadata.collection?.key.equals(collectionMint)
          );
        }
        return true;
      })
      .reduce((cols, nft) => {
        if (nft) {
          const symbol = nft.metadata.data.symbol;

          if (cols[symbol]) {
            cols[symbol].items.push(nft);
          }

          if (!cols[symbol]) {
            cols[symbol] = {
              symbol,
              name: utils.mapSymbolToCollectionTitle(symbol) as string,
              items: [nft],
            };
          }
        }
        return cols;
      }, {} as CollectionMap);

    return Object.values(collectionMap ?? {})
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      .map((col) => {
        col.items.sort((a, b) => {
          if (a.metadata.data.name < b.metadata.data.name) return -1;
          if (a.metadata.data.name > b.metadata.data.name) return 1;
          return 0;
        });
        return col;
      });
  }, [collectionMint, nftQuery.data]);

  return (
    <ModalBody>
      {nftQuery.isLoading ? (
        <Box
          display="flex"
          width="100%"
          height={120}
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="sm" thickness="4px" />
        </Box>
      ) : collections?.length ? (
        collections.map((collection) => {
          return (
            <Collection
              key={collection.symbol}
              collection={collection}
              onSelectItem={onSelect}
            />
          );
        })
      ) : (
        <Box mb="4">
          <Text fontSize="sm">
            {collectionMint ? (
              <Text>
                No NFTs in the {collectionQuery.data?.data.name} collection
                found.
              </Text>
            ) : (
              <Text>
                You do not currently hold any NFTs approved for lending.
              </Text>
            )}
          </Text>
        </Box>
      )}
    </ModalBody>
  );
};

export interface SelectNftModalProps extends ModalProps {
  selected?: NftResult | null;
}

interface CollectionProps {
  collection: CollectionItem;
  onSelectItem: (item: NftResult) => void;
}

const Collection = ({ collection, onSelectItem }: CollectionProps) => {
  const floorPriceQuery = useFloorPriceQuery(collection.symbol);

  const renderItem = useCallback(
    (item: NftResult) => {
      return (
        <Card
          key={item?.tokenAccount.address.toBase58()}
          uri={item?.metadata.data.uri}
          imageAlt={item?.metadata.data.name}
          onClick={() => onSelectItem(item)}
        >
          <Box p="4" pb="6">
            <Box
              mt="1"
              fontWeight="semibold"
              as="h4"
              textAlign="left"
              isTruncated
            >
              {item?.metadata.data.name}
            </Box>
            <VerifiedCollection size="xs" metadata={item?.metadata} />
          </Box>
        </Card>
      );
    },
    [onSelectItem]
  );

  const floorPrice = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice));
    }
  }, [floorPriceQuery.data]);

  return (
    <>
      <SectionHeader
        title={collection.name}
        subtitle={<>Floor Price {floorPrice ?? <EllipsisProgress />}</>}
      />
      <CardList>{collection.items.map(renderItem)}</CardList>
    </>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) => (
  <Box mb="4">
    <Heading color="gray.200" fontWeight="medium" fontSize="sm">
      {title}
    </Heading>
    {subtitle && (
      <Text color="gray.400" fontSize="xs">
        {subtitle}
      </Text>
    )}
  </Box>
);

interface CollectionDetailsProps {
  nft: NftResult;
  forecast: React.ReactNode;
}

export const CollectionDetails = ({
  nft,
  forecast,
}: CollectionDetailsProps) => {
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataFileQuery(nft?.metadata?.data.uri);

  return (
    <Box pb="4" pt="6" px="6">
      <Flex width="100%" gap="4">
        <Flex flex={1}>
          <Box
            h="36"
            w="36"
            position="relative"
            borderRadius="sm"
            overflow="hidden"
          >
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
                    alt={nft?.metadata.data.name}
                    onLoad={() => setVisible(true)}
                  />
                )}
              </Skeleton>
            </Box>
          </Box>
        </Flex>
        <Flex flex={3} flexGrow={1}>
          <Box w="100%">
            <Box pb="4">
              <Heading size="md">{nft?.metadata.data.name}</Heading>
              <VerifiedCollection size="xs" metadata={nft?.metadata} />
            </Box>
            {forecast}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
