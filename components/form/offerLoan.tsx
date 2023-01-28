import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
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
import { useCollectionsQuery } from "../../hooks/query";
import { useOfferLoanMutation } from "../../hooks/mutation/loan";
import { LoanOfferPretty } from "../../common/model";
import {
  LoanFormFields,
  ModalProps,
  SliderField,
  LoanForecast,
  MintDetails,
} from "./common";
import { CollectionJson } from "../../common/types";

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
    formState: { isValid },
    handleSubmit,
  } = useForm<OfferFormFields>({
    mode: "onChange",
    defaultValues,
  });

  const collectionsQuery = useCollectionsQuery();
  const mutation = useOfferLoanMutation(() => onRequestClose());

  const onSubmit = handleSubmit(async (data) => {
    if (collectionsQuery.data) {
      const collection = collectionsQuery.data.find(
        (c) => data.collection === c.address
      );

      if (collection) {
        const options = {
          count: data.offers,
          amount: (data.ltv / 100) * utils.hexToNumber(collection.floorPrice),
          basisPoints: data.apy * 100,
          duration: data.duration * 24 * 60 * 60,
        };

        mutation.mutate({
          options,
          collectionMint: new anchor.web3.PublicKey(collection.mint),
          collection: new anchor.web3.PublicKey(collection.address),
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
          {collectionsQuery.data === undefined ? (
            <Spinner colorScheme="onda" size="sm" thickness="4px" />
          ) : (
            <>
              <Controller
                name="collection"
                control={control}
                render={({ field: { value, onChange } }) => {
                  const selectedCollection = collectionsQuery.data.find(
                    (c) => c.address == value
                  );

                  return (
                    <MintDetails
                      name={selectedCollection?.name ?? undefined}
                      uri={selectedCollection?.uri ?? undefined}
                      info={
                        <OfferListingForecast
                          control={control}
                          collection={selectedCollection}
                        />
                      }
                    />
                  );
                }}
              />
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
                              {collectionsQuery.data?.map((collection) => (
                                <option
                                  key={collection.address}
                                  value={collection.address}
                                >
                                  {collection.name}
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
            disabled={collectionsQuery.isLoading}
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
  collection?: CollectionJson;
}

const OfferListingForecast = ({
  control,
  collection,
}: OfferListingForecastProps) => {
  const { ltv, apy, duration, offers } = useWatch({ control });

  const basisPoints = useMemo(() => (apy ? apy * 100 : undefined), [apy]);
  const durationSeconds = useMemo(
    () => (duration ? utils.toHexString(duration * 86_400) : undefined),
    [duration]
  );

  const creatorBasisPoints = collection?.loanBasisPoints;
  const floorPrice = collection?.floorPrice
    ? utils.hexToNumber(collection?.floorPrice)
    : undefined;

  const amount = useMemo(() => {
    if (floorPrice && ltv && offers) {
      const amount = (ltv / 100) * floorPrice * offers;
      return utils.toHexString(amount);
    }
  }, [floorPrice, ltv, offers]);

  return (
    <LoanForecast
      amountLabel="Lending"
      amount={amount}
      basisPoints={basisPoints}
      creatorBasisPoints={creatorBasisPoints}
      duration={durationSeconds}
    />
  );
};
