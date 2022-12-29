import * as anchor from "@project-serum/anchor";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
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
  SimpleGrid,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import dayjs from "../../common/lib/dayjs";
import { NftResult } from "../../common/types";
import {
  AskCallOptionMutationVariables,
  useAskCallOptionMutation,
} from "../../hooks/mutation";
import {
  CallOptionFormFields,
  SelectNftForm,
  ModalProps,
  SelectNftModalProps,
  CollectionDetails,
  CallOptionDetails,
} from "./common";
import { useCollectionByMintQuery } from "../../hooks/query";
import { CollectionConfig } from "../../common/model";

export const AskCallOptionModal = ({
  open,
  selected = null,
  onRequestClose,
}: SelectNftModalProps) => {
  const [innerSelected, setSelected] = useState<NftResult | null>(selected);
  const mutation = useAskCallOptionMutation(() => onRequestClose());

  useEffect(() => {
    if (selected) {
      setSelected(selected);
    }
  }, [selected]);

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
        <ModalHeader fontSize="xl" fontWeight="black">
          {innerSelected ? "Call Option - Sell" : "Select NFT"}
        </ModalHeader>
        {innerSelected ? (
          <AskCallOptionForm
            isLoading={mutation.isLoading}
            selected={innerSelected}
            onRequestClose={onRequestClose}
            onCancel={selected ? undefined : () => setSelected(null)}
            onSubmit={(vars) => mutation.mutate(vars)}
          />
        ) : (
          <SelectNftForm listingType="callOption" onSelect={setSelected} />
        )}
      </ModalContent>
    </Modal>
  );
};

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

interface AskCallOptionFormProps extends Pick<ModalProps, "onRequestClose"> {
  isLoading: boolean;
  selected: NftResult;
  onCancel?: () => void;
  onSubmit: (data: AskCallOptionMutationVariables) => void;
}

const AskCallOptionForm = ({
  isLoading,
  selected,
  onCancel,
  onRequestClose,
  ...other
}: AskCallOptionFormProps) => {
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

  const onSubmit = handleSubmit((data) => {
    const options = {
      amount: data.amount * anchor.web3.LAMPORTS_PER_SOL,
      strikePrice: data.strikePrice * anchor.web3.LAMPORTS_PER_SOL,
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

  const expiryOptions = useExpiryOptions();

  return (
    <>
      <ModalBody>
        <Details selected={selected} control={control} />
        <Box pb="4" pt="6" pl="6" pr="6">
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
                      <FormLabel htmlFor="strike_price">Strike Price</FormLabel>
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
        {onCancel ? (
          <SimpleGrid columns={2} spacing={2} width="100%">
            <Box>
              <Button isFullWidth disabled={isLoading} onClick={onCancel}>
                Cancel
              </Button>
            </Box>
            <Box>
              <Button
                isFullWidth
                variant="primary"
                isLoading={isLoading}
                onClick={onSubmit}
              >
                Confirm
              </Button>
            </Box>
          </SimpleGrid>
        ) : (
          <Button
            isFullWidth
            variant="primary"
            isLoading={isLoading}
            onClick={onSubmit}
          >
            Confirm
          </Button>
        )}
      </ModalFooter>
    </>
  );
};

interface DetailsProps {
  control: Control<CallOptionFormFields>;
  selected: NftResult;
}

const Details = ({ control, selected }: DetailsProps) => {
  const fields = useWatch({ control });
  const amount = useMemo(
    () =>
      fields.amount
        ? new anchor.BN(fields.amount * anchor.web3.LAMPORTS_PER_SOL)
        : undefined,
    [fields.amount]
  );
  const strikePrice = useMemo(
    () =>
      fields.strikePrice
        ? new anchor.BN(fields.strikePrice * anchor.web3.LAMPORTS_PER_SOL)
        : undefined,
    [fields.strikePrice]
  );
  const expiry = useMemo(
    () => (fields.expiry ? new anchor.BN(fields.expiry) : undefined),
    [fields.expiry]
  );

  const collectionQuery = useCollectionByMintQuery(
    selected?.metadata.collection?.key
  );
  const config = collectionQuery?.data?.data.config as
    | CollectionConfig
    | undefined;

  return (
    <CollectionDetails
      metadata={selected.metadata}
      forecast={
        <CallOptionDetails
          amount={amount}
          strikePrice={strikePrice}
          expiry={expiry}
          creatorBasisPoints={config?.optionBasisPoints}
        />
      }
    />
  );
};
