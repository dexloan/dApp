import * as anchor from "@project-serum/anchor";
import { useForm, useWatch, Control } from "react-hook-form";
import {
  Box,
  Button,
  FormControl,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  IoAnalytics,
  IoCalendar,
  IoPricetag,
  IoArrowForwardCircle,
} from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../common/utils";
import { NFTResult } from "../../common/types";
import { useCollectionsQuery, useFloorPriceQuery } from "../../hooks/query";
import {
  AskLoanMutationVariables,
  useAskLoanMutation,
  useOfferLoanMutation,
} from "../../hooks/mutation/loan";
import { Collection, LoanOfferPretty } from "../../common/model";
import { EllipsisProgress } from "../progress";
import {
  LoanFormFields,
  LoanForecast,
  ModalProps,
  SliderField,
  SelectNFTForm,
} from "./common";
import { useState } from "react";

const defaultValues = {
  ltv: 30,
  apy: 50,
  duration: 30,
};

export const AskLoanModal = ({ open, onRequestClose }: ModalProps) => {
  const [selected, setSelected] = useState<NFTResult | null>(null);
  const mutation = useAskLoanMutation(() => onRequestClose());

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
          Create Listing
        </ModalHeader>
        {selected ? (
          <AskLoanForm
            isLoading={mutation.isLoading}
            selected={selected}
            onRequestClose={onRequestClose}
            onSubmit={(vars) => mutation.mutate(vars)}
          />
        ) : (
          <SelectNFTForm onSelect={setSelected} />
        )}
      </ModalContent>
    </Modal>
  );
};

interface AskLoanFormProps extends Pick<ModalProps, "onRequestClose"> {
  isLoading: boolean;
  selected: NFTResult;
  onSubmit: (data: AskLoanMutationVariables) => void;
}

const AskLoanForm = ({
  isLoading,
  selected,
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

  const floorPriceQuery = useFloorPriceQuery(selected?.metadata.data.symbol);

  const onSubmit = handleSubmit((data) => {
    if (floorPriceQuery.data) {
      const options = {
        amount: (data.ltv / 100) * floorPriceQuery.data.floorPrice,
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
        {floorPriceQuery.data?.floorPrice === undefined ? (
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
            {floorPriceQuery.data?.floorPrice && (
              <AskListingForecast
                control={control}
                floorPrice={floorPriceQuery.data?.floorPrice}
              />
            )}
            <Box pb="4" pt="6" pl="6" pr="6" bg="gray.50" borderRadius="md">
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
        <Button
          colorScheme="green"
          w="100%"
          disabled={floorPriceQuery.isLoading}
          isLoading={isLoading}
          onClick={onSubmit}
        >
          Confirm
        </Button>
      </ModalFooter>
    </>
  );
};

interface AskListingForecastProps {
  control: Control<LoanFormFields, any>;
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
    <LoanForecast
      amountLabel="Lending"
      amount={amount}
      apy={apy}
      duration={duration}
    />
  );
};
