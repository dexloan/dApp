import * as anchor from "@project-serum/anchor";
import { useState, useMemo } from "react";
import {
  Control,
  Controller,
  useForm,
  useWatch,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  Box,
  Button,
  Heading,
  Flex,
  FormLabel,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  IoAnalytics,
  IoCalendar,
  IoPricetag,
  IoArrowForwardCircle,
} from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../common/utils";
import { NFTResult } from "../../common/types";
import {
  useCollectionsQuery,
  useFloorPriceQuery,
  useFloorPricesQuery,
  useLoanOffersByLenderQuery,
} from "../../hooks/query";
import {
  useAskLoanMutation,
  useOfferLoanMutation,
} from "../../hooks/mutation/loan";
import { Collection, LoanOfferPretty } from "../../common/model";
import { EllipsisProgress } from "../progress";
import { useWallet } from "@solana/wallet-adapter-react";

interface FormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface ListingFormProps {
  open: boolean;
  selected: NFTResult | null;
  onRequestClose: () => void;
}

const defaultValues = {
  ltv: 30,
  apy: 50,
  duration: 30,
};

export const AskLoanModal = ({
  open,
  selected,
  onRequestClose,
}: ListingFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues,
  });

  const floorPriceQuery = useFloorPriceQuery(selected?.metadata.data.symbol);
  const mutation = useAskLoanMutation(() => onRequestClose());

  function onSubmit() {
    if (mutation.isLoading) return;

    handleSubmit((data) => {
      if (floorPriceQuery.data) {
        const options = {
          amount: (data.ltv / 100) * floorPriceQuery.data.floorPrice,
          basisPoints: data.apy * 100,
          duration: data.duration * 24 * 60 * 60,
        };

        if (selected && selected.metadata.collection) {
          mutation.mutate({
            options,
            mint: selected.tokenAccount.mint,
            collectionMint: selected.metadata.collection?.key,
          });
        }
      }
    })();
  }

  return (
    <Modal
      isCentered
      size="2xl"
      isOpen={open}
      onClose={() => {
        if (!mutation.isLoading) {
          onRequestClose();
        }
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="2xl" fontWeight="black">
          Borrow Against
        </ModalHeader>
        <ModalBody>
          {floorPriceQuery.data?.floorPrice === undefined ? (
            <Spinner colorScheme="green" size="sm" thickness="4px" />
          ) : (
            <>
              {floorPriceQuery.data?.floorPrice && (
                <AskListingForecast
                  control={control}
                  floorPrice={floorPriceQuery.data?.floorPrice}
                />
              )}
              <Box pb="4" pt="6" pl="6" pr="6" bg="gray.50" borderRadius="md">
                <form onSubmit={onSubmit}>
                  <FormControl isInvalid={!isValid}>
                    <FormField
                      name="ltv"
                      control={control}
                      label="Loan to value"
                      defaultValue={defaultValues.ltv}
                      min={10}
                      max={100}
                      step={5}
                      icon={IoPricetag}
                      units="%"
                    />

                    <FormField
                      name="apy"
                      control={control}
                      label="APY"
                      defaultValue={defaultValues.apy}
                      min={5}
                      max={1000}
                      step={5}
                      icon={IoAnalytics}
                      units="%"
                    />

                    <FormField
                      name="duration"
                      control={control}
                      label="Duration"
                      defaultValue={defaultValues.duration}
                      min={1}
                      max={365}
                      icon={IoCalendar}
                      units="days"
                    />
                  </FormControl>
                </form>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            w="100%"
            disabled={floorPriceQuery.isLoading}
            isLoading={mutation.isLoading}
            onClick={onSubmit}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface OfferFormFields extends FormFields {
  collection: string;
  offers: number;
}

export const OfferLoanModal = ({
  open,
  onRequestClose,
}: Pick<ListingFormProps, "open" | "onRequestClose">) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<OfferFormFields>({
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
      offers: 1,
      collection: undefined,
    },
  });

  const wallet = useWallet();

  const floorPricesQuery = useFloorPricesQuery();
  const loanOffersQuery = useLoanOffersByLenderQuery(wallet.publicKey);
  const collectionsQuery = useCollectionsQuery();
  const collections = useMemo(
    () => (collectionsQuery.data || []).map(Collection.fromJSON),
    [collectionsQuery.data]
  );

  const mutation = useOfferLoanMutation(() => onRequestClose());

  function onSubmit() {
    if (mutation.isLoading) return;

    handleSubmit((data) => {
      if (floorPricesQuery.data) {
        const collection = collections.find(
          (c) => data.collection === c.publicKey.toBase58()
        );

        if (collection?.metadata?.data.symbol) {
          const floorPrice =
            floorPricesQuery.data[collection.metadata.data.symbol];

          const options = {
            amount: (data.ltv / 100) * floorPrice,
            basisPoints: data.apy * 100,
            duration: data.duration * 24 * 60 * 60,
          };

          const ids = loanOffersQuery.data
            ? pickIds(loanOffersQuery.data, data.offers)
            : [0];

          mutation.mutate({
            ids,
            options,
            collection: collection.publicKey,
          });
        }
      }
    })();
  }

  return (
    <Modal
      isCentered
      size="2xl"
      isOpen={open}
      onClose={() => {
        if (!mutation.isLoading) {
          onRequestClose();
        }
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl" fontWeight="black">
          Offer Loan
        </ModalHeader>
        <ModalBody>
          {floorPricesQuery.data === undefined ? (
            <Spinner colorScheme="onda" size="sm" thickness="4px" />
          ) : (
            <>
              {floorPricesQuery.data && (
                <OfferListingForecast
                  control={control}
                  collections={collections}
                  floorPrices={floorPricesQuery.data}
                />
              )}
              <Box pb="4" pt="6" pl="6" pr="6">
                <form onSubmit={onSubmit}>
                  <FormControl isInvalid={!isValid}>
                    <Box pb="8">
                      <Controller
                        name="collection"
                        control={control}
                        rules={{
                          required: true,
                        }}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => (
                          <FormControl isInvalid={Boolean(error)}>
                            <FormLabel htmlFor="expiry">Collection</FormLabel>
                            <Select
                              name="collection"
                              placeholder="Select collection"
                              value={value}
                              onChange={onChange}
                            >
                              {collections.map((collection) => (
                                <option
                                  key={collection.publicKey.toBase58()}
                                  value={collection.publicKey.toBase58()}
                                >
                                  {collection.metadata.data.name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Box>

                    <FormField
                      name="ltv"
                      control={control}
                      label="Loan to value"
                      defaultValue={defaultValues.ltv}
                      min={10}
                      max={100}
                      step={5}
                      icon={IoPricetag}
                      units="%"
                    />

                    <FormField
                      name="apy"
                      control={control}
                      label="APY"
                      defaultValue={defaultValues.apy}
                      min={5}
                      max={1000}
                      step={5}
                      icon={IoAnalytics}
                      units="%"
                    />

                    <FormField
                      name="duration"
                      control={control}
                      label="Duration"
                      defaultValue={defaultValues.duration}
                      min={1}
                      max={365}
                      icon={IoCalendar}
                      units="days"
                    />

                    <FormField
                      name="offers"
                      control={control}
                      label="Number of offers"
                      defaultValue={1}
                      min={1}
                      max={10}
                      icon={IoCalendar}
                      units={(v) => (v === 1 ? "offer" : "offers")}
                    />
                  </FormControl>
                </form>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray.900"
            bg="gray.50"
            _hover={{
              bg: "gray.100",
            }}
            _active={{
              bg: "gray.100",
            }}
            w="100%"
            disabled={floorPricesQuery.isLoading || loanOffersQuery.isLoading}
            isLoading={mutation.isLoading}
            onClick={onSubmit}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

function pickIds(offers: LoanOfferPretty[], count: number) {
  const ids = [];
  const existingIds = offers.map((o) => o.data.id);

  let id = 0;
  while (ids.length <= count && id <= 255) {
    if (existingIds.includes(id)) {
      continue;
    } else {
      ids.push(id);
    }
  }

  return ids;
}

interface AskListingForecastProps {
  control: Control<FormFields, any>;
  floorPrice: number;
}

const AskListingForecast = ({
  control,
  floorPrice,
}: AskListingForecastProps) => {
  const { ltv, apy, duration } = useWatch({ control });

  if (!ltv || !apy || !duration) return null;

  const amount = new anchor.BN((ltv / 100) * floorPrice);

  const interest = utils.calculateInterestOnMaturity(
    amount,
    new anchor.BN(duration * 24 * 60 * 60),
    apy * 100
  );

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
          Borrowing
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {utils.formatAmount(amount)}
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
          {utils.formatAmount(interest)}
        </Heading>
      </Box>
    </Flex>
  );
};

interface OfferListingForecastProps {
  control: Control<OfferFormFields, any>;
  collections: Collection[];
  floorPrices: Record<string, number>;
}

const OfferListingForecast = ({
  control,
  collections = [],
  floorPrices = {},
}: OfferListingForecastProps) => {
  const { ltv, apy, duration, offers, collection } = useWatch({ control });

  if (!ltv || !apy || !duration || !offers) return null;

  const collectionSymbol = collection
    ? collections.find((c) => c.publicKey.toBase58() == collection)?.metadata
        .data.symbol
    : undefined;

  const symbol = collectionSymbol
    ? utils.trimNullChars(collectionSymbol).toLowerCase()
    : undefined;
  const floorPrice = symbol ? floorPrices[symbol] : undefined;

  const amount = floorPrice
    ? new anchor.BN((ltv / 100) * floorPrice * offers)
    : undefined;

  return (
    <ListingForecast
      amountLabel="Lending"
      amount={amount}
      apy={apy}
      duration={duration}
    />
  );
};

interface ListingForecastProps {
  amountLabel?: string;
  duration: number;
  amount?: anchor.BN;
  apy: number;
}

const ListingForecast = ({
  amount,
  amountLabel = "Borrowing",
  duration,
  apy,
}: ListingForecastProps) => {
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

const FormField = <Fields extends FieldValues>({
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
