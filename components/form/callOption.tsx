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
} from "@chakra-ui/react";
import { useMemo } from "react";

import dayjs from "../../common/lib/dayjs";
import { useAskCallOptionMutation } from "../../hooks/mutation";
import { NftResult } from "../../common/types";
import { CallOptionFormFields } from "./common";

export const useExpiryOptions = () => {
  return useMemo(() => {
    return Array(24)
      .fill(undefined)
      .map((_, i) =>
        dayjs()
          .tz("America/New_York")
          .startOf("month")
          .add(i + 1, "month")
          .startOf("month")
          .day(6)
          .add(2, "week")
          .unix()
      );
  }, []);
};

interface ListingFormProps {
  open: boolean;
  selected: NftResult | null;
  onRequestClose: () => void;
}

export const AskCallOptionModal = ({
  open,
  selected,
  onRequestClose,
}: ListingFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CallOptionFormFields>({
    mode: "onChange",
    defaultValues: {
      amount: undefined,
      strikePrice: undefined,
      expiry: undefined,
    },
  });

  const mutation = useAskCallOptionMutation(() => onRequestClose());

  const onSubmit = handleSubmit((data) => {
    const options = {
      amount: data.amount * anchor.web3.LAMPORTS_PER_SOL,
      strikePrice: data.strikePrice * anchor.web3.LAMPORTS_PER_SOL,
      expiry: data.expiry,
    };

    if (selected && selected.metadata.collection) {
      mutation.mutate({
        options,
        mint: selected.tokenAccount.mint,
        collectionMint: selected.metadata.collection.key,
      });
    }
  });

  const expiryOptions = useExpiryOptions();

  return (
    <Modal
      isCentered
      size="3xl"
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
          Sell Call Option
        </ModalHeader>
        <ModalBody>
          <Box pb="4" pt="6" pl="6" pr="6" bg="gray.50" borderRadius="md">
            <form onSubmit={onSubmit}>
              <FormControl isInvalid={!isValid}>
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
              </FormControl>
            </form>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            w="100%"
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
