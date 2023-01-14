import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
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
  Divider,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import Image from "next/image";

import * as utils from "../../common/utils";
import dayjs from "../../common/lib/dayjs";
import {
  NftResult,
  CollectionItem,
  CollectionMap,
  TokenManagerAccountState,
} from "../../common/types";
import {
  useNftByOwnerQuery,
  useTokenManagerQuery,
  useMetadataFileQuery,
  useMetadataQuery,
  useCollectionByMintQuery,
} from "../../hooks/query";
import { useFloorPrice } from "../../hooks/render";
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
  creatorBasisPoints?: number;
}

export const LoanForecast = ({
  amount,
  amountLabel = "Borrowing",
  duration,
  basisPoints,
  creatorBasisPoints,
}: LoanForecastProps) => {
  const totalDue = useMemo(() => {
    if (
      amount &&
      basisPoints !== undefined &&
      creatorBasisPoints !== undefined &&
      duration
    ) {
      return utils.formatTotalDue(
        amount,
        new anchor.BN(Date.now() / 1000).sub(duration),
        basisPoints + creatorBasisPoints,
        false
      );
    }
  }, [amount, duration, basisPoints, creatorBasisPoints]);

  const days = useMemo(() => {
    if (duration) {
      return duration.toNumber() / 86_400;
    }
  }, [duration]);

  return (
    <Flex direction="column" gap="2" justify="space-between">
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="xs" color="gray.500">
          {amountLabel}
        </Text>
        <Text fontSize="xs" whiteSpace="nowrap">
          {amount ? utils.formatAmount(amount) : <EllipsisProgress />}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          Duration
        </Text>
        <Text fontSize="xs" whiteSpace="nowrap">
          {days} days
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          Lender Interest Rate
        </Text>
        <Text fontSize="xs" whiteSpace="nowrap">
          {typeof basisPoints === "number" ? (
            utils.formatBasisPoints(basisPoints) + " APY"
          ) : (
            <EllipsisProgress />
          )}
        </Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          Creator Interest Rate
        </Text>
        <Text fontSize="xs" whiteSpace="nowrap">
          {typeof creatorBasisPoints === "number" ? (
            utils.formatBasisPoints(creatorBasisPoints) + " APY"
          ) : (
            <EllipsisProgress />
          )}
        </Text>
      </Flex>
      <Divider />
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500">
          Total payable on maturity
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {totalDue ?? <EllipsisProgress />}
        </Text>
      </Flex>
    </Flex>
  );
};

interface CallOptionDetailsProps {
  amount?: anchor.BN;
  strikePrice?: anchor.BN;
  expiry?: anchor.BN;
  creatorBasisPoints?: number;
}

export const CallOptionDetails = ({
  amount,
  strikePrice,
  expiry,
  creatorBasisPoints,
}: CallOptionDetailsProps) => {
  return (
    <Flex direction="column" gap="2" justify="space-between">
      <Flex direction="row" justifyContent="space-between" w="100%">
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Strike Price
        </Text>
        <Text fontSize="sm" whiteSpace="nowrap">
          {strikePrice ? utils.formatAmount(strikePrice) : <EllipsisProgress />}
        </Text>
      </Flex>
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
      <Tooltip label="Creator's split of the option cost">
        <Flex direction="row" justifyContent="space-between" w="100%">
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            Creator Fee
          </Text>
          <Text fontSize="sm" whiteSpace="nowrap">
            {creatorBasisPoints ? (
              utils.formatBasisPoints(creatorBasisPoints)
            ) : (
              <EllipsisProgress />
            )}
          </Text>
        </Flex>
      </Tooltip>
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

type ListingType = "loan" | "callOption" | "rental";

interface SelectNftFormProps {
  listingType: ListingType;
  collectionMint?: anchor.web3.PublicKey;
  onSelect: (selected: NftResult) => void;
}

export const SelectNftForm = ({
  listingType,
  collectionMint,
  onSelect,
}: SelectNftFormProps) => {
  const wallet = useAnchorWallet();
  // TODO pass full CollectionJson object to avoid querying here?
  const metadataQuery = useMetadataQuery(collectionMint?.toBase58());
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
      .filter((nft) => {
        if (nft.tokenManager) {
          // @ts-expect-error
          const loan = nft.tokenManager.accounts.loan as boolean;
          // @ts-expect-error
          const callOption = nft.tokenManager.accounts.callOption as boolean;
          // @ts-expect-error
          const rental = nft.tokenManager.accounts.rental;

          if (
            (listingType === "loan" || listingType === "callOption") &&
            (loan || callOption)
          ) {
            return false;
          }
          if (listingType === "rental" && rental) {
            return false;
          }
        }
        return true;
      })
      .reduce((cols, nft) => {
        if (nft) {
          const mint = nft.metadata.collection?.key.toBase58();

          if (mint) {
            if (cols[mint]) {
              cols[mint].items.push(nft);
            }

            if (!cols[mint]) {
              cols[mint] = {
                mint,
                items: [nft],
              };
            }
          }
        }
        return cols;
      }, {} as CollectionMap);

    return Object.values(collectionMap ?? {}).map((col) => {
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
        collections.map(({ items, mint }) => {
          return (
            <Collection
              key={mint}
              listingType={listingType}
              mint={mint}
              items={items}
              onSelectItem={onSelect}
            />
          );
        })
      ) : (
        <Box mb="6">
          <Text fontSize="sm">
            {collectionMint ? (
              <Text>
                No NFTs in the {metadataQuery.data?.data.name} collection found.
              </Text>
            ) : (
              <Text>
                You do not currently hold any NFTs approved for trading on Onda
                Protocol.
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
  mint: string;
  items: NftResult[];
  listingType: ListingType;
  onSelectItem: (item: NftResult) => void;
}

const Collection = ({
  mint,
  items,
  listingType,
  onSelectItem,
}: CollectionProps) => {
  const collectionQuery = useCollectionByMintQuery(mint);
  const floorPrice = useMemo(() => {
    if (collectionQuery.data) {
      return utils.formatHexAmount(collectionQuery.data.floorPrice);
    }
  }, [collectionQuery.data]);

  const renderItem = useCallback(
    (item: NftResult) => {
      return (
        <NftItem
          item={item}
          listingType={listingType}
          onSelectItem={() => onSelectItem(item)}
        />
      );
    },
    [listingType, onSelectItem]
  );

  return (
    <>
      <SectionHeader
        title={collectionQuery.data?.name}
        subtitle={<>Floor Price {floorPrice ?? <EllipsisProgress />}</>}
      />
      <CardList>{items.map(renderItem)}</CardList>
    </>
  );
};

interface NftItemProps {
  item: NftResult;
  listingType: ListingType;
  onSelectItem: () => void;
}

const NftItem = ({ item, listingType, onSelectItem }: NftItemProps) => {
  const wallet = useWallet();
  const metadataQuery = useMetadataQuery(
    item.metadata.collection?.key.toBase58()
  );

  const tokenManagerQuery = useTokenManagerQuery(
    item.metadata.mint,
    wallet.publicKey
  );
  const accounts = tokenManagerQuery.data?.accounts as
    | TokenManagerAccountState
    | undefined;

  if (tokenManagerQuery.isLoading) {
    return null;
  }

  if (listingType === "callOption" && accounts?.loan) {
    return null;
  }

  if (listingType === "loan" && accounts?.callOption) {
    return null;
  }

  return (
    <Card
      key={item?.tokenAccount.address.toBase58()}
      uri={item?.metadata.data.uri}
      imageAlt={item?.metadata.data.name}
      onClick={onSelectItem}
    >
      <Box p="4" pb="6">
        <Box mt="1" fontWeight="semibold" as="h4" textAlign="left" isTruncated>
          {item?.metadata.data.name}
        </Box>
        <Text fontSize="xs" color="gray.500">
          {metadataQuery.data?.data.name ?? <EllipsisProgress />}
        </Text>
      </Box>
    </Card>
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
  metadata?: NftResult["metadata"];
  forecast: React.ReactNode;
}

export const CollectionDetails = ({
  metadata,
  forecast,
}: CollectionDetailsProps) => {
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataFileQuery(metadata?.data.uri);

  return (
    <Box pb="4" pt="2" px="6">
      <Flex width="100%" gap="4">
        <Flex flex={1}>
          <Box
            h="44"
            w="44"
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
                    alt={metadata?.data.name}
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
              <Heading size="md">{metadata?.data.name}</Heading>
              <VerifiedCollection size="xs" metadata={metadata} />
            </Box>
            {forecast}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
