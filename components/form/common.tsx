import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState, useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Box,
  Button,
  Heading,
  Flex,
  FormLabel,
  ModalBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { IoArrowForwardCircle } from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../common/utils";
import { NFTResult, CollectionItem, CollectionMap } from "../../common/types";
import { useNFTByOwnerQuery, useFloorPriceQuery } from "../../hooks/query";
import { Card, CardList } from "../card";
import { VerifiedCollection } from "../collection";
import { EllipsisProgress } from "../progress";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export interface ModalProps {
  open: boolean;
  onRequestClose: () => void;
}

export interface LoanFormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface LoanForecastProps {
  amountLabel?: string;
  duration: number;
  amount?: anchor.BN;
  apy: number;
}

export const LoanForecast = ({
  amount,
  amountLabel = "Borrowing",
  duration,
  apy,
}: LoanForecastProps) => {
  const interest = useMemo(() => {
    if (amount) {
      return utils.calculateInterestOnMaturity(
        amount,
        new anchor.BN(duration * 24 * 60 * 60),
        apy * 100
      );
    }
  }, [amount, duration, apy]);

  return (
    <Flex
      direction="row"
      gap="4"
      align="center"
      justify="space-between"
      p={{ base: "0", md: "6" }}
      wrap="wrap"
    >
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.500">
          {amountLabel}
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {amount ? utils.formatAmount(amount) : <EllipsisProgress />}
        </Heading>
      </Box>
      <Box
        size="2rem"
        as={IoArrowForwardCircle}
        mb="2"
        display={{ base: "none", md: "block" }}
      />
      <Box>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.500"
          whiteSpace="nowrap"
        >
          Duration
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {duration} days
        </Heading>
      </Box>
      <Box
        size="2rem"
        as={IoArrowForwardCircle}
        mb="2"
        display={{ base: "none", md: "block" }}
      />
      <Box>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.500"
          whiteSpace="nowrap"
        >
          Interest
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {interest ? utils.formatAmount(interest) : <EllipsisProgress />}
        </Heading>
      </Box>
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

interface SelectNFTFormProps {
  onSelect: (selected: NFTResult) => void;
}

export const SelectNFTForm = ({ onSelect }: SelectNFTFormProps) => {
  const modal = useWalletModal();
  const wallet = useAnchorWallet();
  const nftQuery = useNFTByOwnerQuery(wallet);

  const collections = useMemo(() => {
    const collectionMap = nftQuery.data?.reduce((cols, nft) => {
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

    return Object.values(collectionMap ?? {}).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }, [nftQuery.data]);

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
        <Box>
          <Text>You do not currently hold any NFTs approved for lending.</Text>
        </Box>
      )}
    </ModalBody>
  );
};

interface CollectionProps {
  collection: CollectionItem;
  onSelectItem: (item: NFTResult) => void;
}

const Collection = ({ collection, onSelectItem }: CollectionProps) => {
  const floorPriceQuery = useFloorPriceQuery(collection.symbol);

  const renderItem = useCallback(
    (item: NFTResult) => {
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
            <VerifiedCollection size="xs" symbol={item?.metadata.data.symbol} />
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
