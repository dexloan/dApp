import * as anchor from "@project-serum/anchor";
import {
  Box,
  Button,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Control } from "react-hook-form";
import { IoAnalytics, IoCalendar, IoPricetag } from "react-icons/io5";
import { NftResult } from "../../common/types";
import { Collection } from "../../common/model";
import { useCollectionByMintQuery } from "../../hooks/query";
import { useFloorPrice } from "../../hooks/render";
import {
  AskLoanMutationVariables,
  useAskLoanMutation,
} from "../../hooks/mutation/loan";
import {
  LoanFormFields,
  LoanForecast,
  ModalProps,
  SliderField,
  SelectNftForm,
  CollectionDetails,
} from "./common";

const defaultValues = {
  ltv: 30,
  apy: 50,
  duration: 30,
};

interface AskLoanModalProps extends ModalProps {
  selected?: NftResult | null;
}

export const AskLoanModal = ({
  open,
  selected = null,
  onRequestClose,
}: AskLoanModalProps) => {
  const [innerSelected, setSelected] = useState<NftResult | null>(selected);
  const mutation = useAskLoanMutation(() => onRequestClose());

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
          {innerSelected ? "Loan - Create Ask" : "Select NFT"}
        </ModalHeader>
        {innerSelected ? (
          <AskLoanForm
            isLoading={mutation.isLoading}
            selected={innerSelected}
            onRequestClose={onRequestClose}
            onCancel={selected ? undefined : () => setSelected(null)}
            onSubmit={(vars) => mutation.mutate(vars)}
          />
        ) : (
          <SelectNftForm listingType="loan" onSelect={setSelected} />
        )}
      </ModalContent>
    </Modal>
  );
};

interface AskLoanFormProps extends Pick<ModalProps, "onRequestClose"> {
  isLoading: boolean;
  selected: NftResult;
  onCancel?: () => void;
  onSubmit: (data: AskLoanMutationVariables) => void;
}

const AskLoanForm = ({
  isLoading,
  selected,
  onCancel,
  onRequestClose,
  ...other
}: AskLoanFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoanFormFields>({
    mode: "onChange",
    defaultValues,
  });

  const floorPrice = useFloorPrice(selected?.metadata.data.symbol);
  const collectionQuery = useCollectionByMintQuery(
    selected?.metadata.collection?.key
  );
  const collection = useMemo(() => {
    if (collectionQuery.data) {
      return Collection.fromJSON(collectionQuery.data);
    }
  }, [collectionQuery.data]);
  console.log(collection);
  const onSubmit = handleSubmit((data) => {
    if (floorPrice) {
      const options = {
        amount: (data.ltv / 100) * floorPrice,
        basisPoints: data.apy * 100,
        duration: data.duration * 24 * 60 * 60,
      };

      if (selected && selected.metadata.collection) {
        other.onSubmit({
          options,
          mint: selected.tokenAccount.mint,
          collectionMint: selected.metadata.collection?.key,
        });
      }
    }
  });

  return (
    <>
      <ModalBody>
        {floorPrice === undefined ? (
          <Box
            display="flex"
            flex={1}
            justifyContent="center"
            alignItems="center"
          >
            <Spinner size="sm" thickness="4px" />
          </Box>
        ) : (
          <>
            <CollectionDetails
              metadata={selected.metadata}
              forecast={
                floorPrice && (
                  <AskListingForecast
                    control={control}
                    creatorBasisPoints={collection?.config.loanBasisPoints}
                    floorPrice={floorPrice}
                  />
                )
              }
            />
            <Box pb="4" pt="6" pl="6" pr="6">
              <form onSubmit={onSubmit}>
                <FormControl isInvalid={!isValid}>
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
                </FormControl>
              </form>
            </Box>
          </>
        )}
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
                disabled={floorPrice === undefined}
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
            disabled={floorPrice === undefined}
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

interface AskListingForecastProps {
  control: Control<LoanFormFields, any>;
  floorPrice: number;
  creatorBasisPoints?: number;
}

const AskListingForecast = ({
  control,
  floorPrice,
  creatorBasisPoints,
}: AskListingForecastProps) => {
  const { ltv, apy, duration } = useWatch({ control });

  if (!ltv || !apy || !duration) return null;

  const amount = new anchor.BN((ltv / 100) * floorPrice);
  const durationSeconds = new anchor.BN(duration * 86_400);
  const basisPoints = apy * 100;

  return (
    <LoanForecast
      amountLabel="Borrowing"
      amount={amount}
      basisPoints={basisPoints}
      creatorBasisPoints={creatorBasisPoints}
      duration={durationSeconds}
    />
  );
};
