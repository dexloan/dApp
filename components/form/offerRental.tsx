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
import { useMemo, useState } from "react";

import dayjs from "../../common/lib/dayjs";
import { NftResult } from "../../common/types";
import {
  InitRentalMutationVariables,
  useInitRentalMutation,
} from "../../hooks/mutation";
import { SelectNftForm, ModalProps, SelectNftModalProps } from "./common";

export const OfferRentalModal = ({
  open,
  selected = null,
  onRequestClose,
}: SelectNftModalProps) => {
  const [innerSelected, setSelected] = useState<NftResult | null>(selected);
  const mutation = useInitRentalMutation(() => onRequestClose());

  return (
    <Modal
      isCentered
      size={innerSelected ? "2xl" : "4xl"}
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
          Offer Rental
        </ModalHeader>
        {innerSelected ? (
          <OfferRentalForm
            isLoading={mutation.isLoading}
            selected={innerSelected}
            onRequestClose={onRequestClose}
            onCancel={() => setSelected(null)}
            onSubmit={(vars) => mutation.mutate(vars)}
          />
        ) : (
          <SelectNftForm listingType="rental" onSelect={setSelected} />
        )}
      </ModalContent>
    </Modal>
  );
};

interface OfferRentalFormFields {
  amount: number;
  expiry: number;
  // TODO private borrowings
  // borrower: string;
}

interface OfferRentalFormProps extends Pick<ModalProps, "onRequestClose"> {
  isLoading: boolean;
  selected: NftResult;
  onCancel: () => void;
  onSubmit: (data: InitRentalMutationVariables) => void;
}

const OfferRentalForm = ({
  isLoading,
  selected,
  onCancel,
  onRequestClose,
  ...other
}: OfferRentalFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<OfferRentalFormFields>({
    mode: "onChange",
    defaultValues: {
      amount: undefined,
      expiry: undefined,
      // TODO borrower: null,
    },
  });

  const onSubmit = handleSubmit((data) => {
    const options = {
      amount: data.amount * anchor.web3.LAMPORTS_PER_SOL,
      expiry: data.expiry,
    };

    if (selected && selected.metadata.collection) {
      other.onSubmit({
        options,
        mint: selected.tokenAccount.mint,
        collectionMint: selected.metadata.collection.key,
      });
    }
  });

  const expiryOptions = useMemo(() => {
    return Array(24)
      .fill(undefined)
      .map((_, i) =>
        dayjs()
          .tz("America/New_York")
          .startOf("month")
          .add(i + 1, "month")
          .startOf("month")
          .unix()
      );
  }, []);

  return (
    <>
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
                      <FormLabel htmlFor="cost">Rental Cost</FormLabel>
                      <Input
                        name="cost"
                        placeholder="0.00◎"
                        value={value}
                        onChange={onChange}
                      />
                      <FormHelperText>
                        The daily cost to rent your NFT
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
                              .format("LL")}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>
                        The latest date the NFT can be rented
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
          variant="primary"
          w="100%"
          isLoading={isLoading}
          onClick={onSubmit}
        >
          Confirm
        </Button>
      </ModalFooter>
    </>
  );
};
