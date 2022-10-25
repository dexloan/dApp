import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useWallet } from "@solana/wallet-adapter-react";
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
import {
  useCollectionsQuery,
  useCallOptionBidsByBuyerQuery,
} from "../../hooks/query";
import { useBidCallOptionMutation } from "../../hooks/mutation";
import { Collection, CallOptionBidPretty } from "../../common/model";
import { CallOptionFormFields, ModalProps, SliderField } from "./common";
import { useExpiryOptions } from "./callOption";

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

export const OfferLoanModal = ({ open, onRequestClose }: ModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<BidFormFields>({
    mode: "onChange",
    defaultValues,
  });

  const expiryOptions = useExpiryOptions();

  const wallet = useWallet();

  const bidsQuery = useCallOptionBidsByBuyerQuery(wallet.publicKey);
  const collectionsQuery = useCollectionsQuery();
  const collections = useMemo(
    () => (collectionsQuery.data || []).map(Collection.fromJSON),
    [collectionsQuery.data]
  );

  const mutation = useBidCallOptionMutation(() => onRequestClose());

  const onSubmit = handleSubmit((data) => {
    const collection = collections.find(
      (c) => data.collection === c.publicKey.toBase58()
    );

    if (collection?.metadata?.data.symbol) {
      const ids = bidsQuery.data?.length
        ? pickIds(bidsQuery.data, data.offers)
        : [0];

      const options = {
        amount: data.amount * anchor.web3.LAMPORTS_PER_SOL,
        strikePrice: data.strikePrice * anchor.web3.LAMPORTS_PER_SOL,
        expiry: data.expiry,
      };

      mutation.mutate({
        ids,
        options,
        collectionMint: collection.metadata.mint,
        collection: collection.publicKey,
      });
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
          {bidsQuery.data === undefined ? (
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
                            {expiryOptions.map((unix) => (
                              <option key={unix.toString()} value={unix}>
                                {dayjs
                                  .unix(unix)
                                  .tz("America/New_York")
                                  .format("DD/MM/YYYY")}
                              </option>
                            ))}
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
                    max={10}
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
            disabled={bidsQuery.isLoading}
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

function pickIds(bids: CallOptionBidPretty[], count: number) {
  const ids = [];
  const existingIds = bids.map((o) => o.data.id);

  let id = 0;
  while (ids.length < count && id <= 255) {
    if (!existingIds.includes(id)) {
      ids.push(id);
    }
    id++;
  }

  return ids;
}
