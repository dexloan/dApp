import * as anchor from "@project-serum/anchor";
import { useForm, useWatch, Control } from "react-hook-form";
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
import { useWallet } from "@solana/wallet-adapter-react";
import { IoAnalytics, IoCalendar, IoPricetag } from "react-icons/io5";
import { NFTResult } from "../../common/types";
import { useFloorPriceQuery } from "../../hooks/query";
import {
  AskLoanMutationVariables,
  useAskLoanMutation,
} from "../../hooks/mutation/loan";
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
      size={selected ? "2xl" : "4xl"}
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
          {selected ? "Create Ask" : "Select NFT"}
        </ModalHeader>
        {selected ? (
          <AskLoanForm
            isLoading={mutation.isLoading}
            selected={selected}
            onRequestClose={onRequestClose}
            onCancel={() => setSelected(null)}
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
  onCancel: () => void;
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
        <SimpleGrid columns={2} spacing={1} width="100%">
          <Box>
            <Button isFullWidth disabled={isLoading} onClick={onCancel}>
              Cancel
            </Button>
          </Box>
          <Box>
            <Button
              isFullWidth
              variant="primary"
              disabled={floorPriceQuery.isLoading}
              isLoading={isLoading}
              onClick={onSubmit}
            >
              Confirm
            </Button>
          </Box>
        </SimpleGrid>
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

  return (
    <LoanForecast
      amountLabel="Lending"
      amount={amount}
      apy={apy}
      duration={duration}
    />
  );
};
