import * as anchor from "@project-serum/anchor";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  FormHelperText,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { IoCalendar } from "react-icons/io5";

import dayjs from "../../common/lib/dayjs";
import { useCollectionsQuery } from "../../hooks/query";
import { useBidCallOptionMutation } from "../../hooks/mutation";
import { CallOptionFormFields, ModalProps, SliderField } from "./common";
import { useExpiryOptions } from "./askCallOption";

interface BidFormFields extends CallOptionFormFields {
  collection: string;
  offers: number;
}

const defaultValues = {
  amount: undefined,
  strikePrice: undefined,
  expiry: undefined,
  offers: 1,
  collection: undefined,
};

export const BidCallOptionModal = ({ open, onRequestClose }: ModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<BidFormFields>({
    mode: "onChange",
    defaultValues,
  });

  const expiryOptions = useExpiryOptions();
  const collectionsQuery = useCollectionsQuery();
  const mutation = useBidCallOptionMutation(() => onRequestClose());

  const onSubmit = handleSubmit((data) => {
    if (collectionsQuery.data) {
      const collection = collectionsQuery.data.find(
        (c) => data.collection === c.address
      );

      if (collection) {
        const options = {
          count: data.offers,
          amount: data.amount * anchor.web3.LAMPORTS_PER_SOL,
          strikePrice: data.strikePrice * anchor.web3.LAMPORTS_PER_SOL,
          expiry: data.expiry,
        };

        mutation.mutate({
          options,
          collectionMint: new anchor.web3.PublicKey(collection.mint),
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
          Bid Call Option
        </ModalHeader>
        <ModalBody>
          {collectionsQuery.data === undefined ? (
            <Spinner colorScheme="onda" size="sm" thickness="4px" />
          ) : (
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
                            {collectionsQuery.data.map((collection) => (
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

                  <Box pb="6">
                    <Controller
                      name="amount"
                      control={control}
                      rules={{
                        required: true,
                        validate: (value) => {
                          return !isNaN(value);
                        },
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <FormControl isInvalid={Boolean(error)}>
                          <FormLabel htmlFor="cost">Cost</FormLabel>
                          <Input
                            name="cost"
                            placeholder="0.00◎"
                            value={value}
                            onChange={onChange}
                          />
                          <FormHelperText>
                            The cost of the call option
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Box pb="6">
                    <Controller
                      name="strikePrice"
                      control={control}
                      rules={{
                        required: true,
                        validate: (value) => {
                          return !isNaN(value);
                        },
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <FormControl isInvalid={Boolean(error)}>
                          <FormLabel htmlFor="strike_price">
                            Strike Price
                          </FormLabel>
                          <Input
                            name="strike_price"
                            placeholder="0.00◎"
                            value={value}
                            onChange={onChange}
                          />
                          <FormHelperText>
                            The price at which the NFT can be bought
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Box pb="6">
                    <Controller
                      name="expiry"
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <FormControl isInvalid={Boolean(error)}>
                          <FormLabel htmlFor="expiry">Expiry</FormLabel>
                          <Select
                            name="expiry"
                            placeholder="Select expiry"
                            value={value}
                            onChange={onChange}
                          >
                            {expiryOptions.map((unix) => {
                              return (
                                <option key={unix.toString()} value={unix}>
                                  {dayjs
                                    .unix(unix)
                                    .tz("America/New_York")
                                    .format("LLL")}
                                </option>
                              );
                            })}
                          </Select>
                          <FormHelperText>
                            The date the call option is valid until
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Box>

                  <SliderField
                    name="offers"
                    control={control}
                    label="Number of offers"
                    defaultValue={1}
                    min={1}
                    max={8}
                    icon={IoCalendar}
                    units={(v) => (v === 1 ? "offer" : "offers")}
                  />
                </FormControl>
              </form>
            </Box>
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
