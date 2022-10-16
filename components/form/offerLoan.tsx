import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { IoAnalytics, IoCalendar, IoPricetag } from "react-icons/io5";
import * as utils from "../../common/utils";
import {
  useCollectionsQuery,
  useFloorPricesQuery,
  useLoanOffersByLenderQuery,
} from "../../hooks/query";
import { useOfferLoanMutation } from "../../hooks/mutation/loan";
import { Collection, LoanOfferPretty } from "../../common/model";
import {
  LoanFormFields,
  ModalProps,
  SliderField,
  LoanForecast,
} from "./common";

interface OfferFormFields extends LoanFormFields {
  collection: string;
  offers: number;
}

const defaultValues = {
  ltv: 30,
  apy: 50,
  duration: 30,
  offers: 1,
  collection: undefined,
};

export const OfferLoanModal = ({ open, onRequestClose }: ModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<OfferFormFields>({
    mode: "onChange",
    defaultValues,
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

  const onSubmit = handleSubmit((data) => {
    if (floorPricesQuery.data) {
      const collection = collections.find(
        (c) => data.collection === c.publicKey.toBase58()
      );

      if (collection?.metadata?.data.symbol) {
        const floorPrice = utils.getFloorPrice(
          floorPricesQuery.data,
          collection.metadata.data.symbol
        );

        if (!floorPrice) {
          throw new Error("floor price not found");
        }

        const options = {
          amount: (data.ltv / 100) * floorPrice,
          basisPoints: data.apy * 100,
          duration: data.duration * 24 * 60 * 60,
        };

        const ids = loanOffersQuery.data?.length
          ? pickIds(loanOffersQuery.data, data.offers)
          : [0];

        mutation.mutate({
          ids,
          options,
          collectionMint: collection.metadata.mint,
          collection: collection.publicKey,
        });
      }
    }
  });

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

                    <SliderField
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

                    <SliderField
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

                    <SliderField
                      name="duration"
                      control={control}
                      label="Duration"
                      defaultValue={defaultValues.duration}
                      min={1}
                      max={365}
                      icon={IoCalendar}
                      units="days"
                    />

                    <SliderField
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
            isFullWidth
            variant="primary"
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
  while (ids.length < count && id <= 255) {
    if (!existingIds.includes(id)) {
      ids.push(id);
    }
    id++;
  }

  return ids;
}

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
    <LoanForecast
      amountLabel="Lending"
      amount={amount}
      apy={apy}
      duration={duration}
    />
  );
};
