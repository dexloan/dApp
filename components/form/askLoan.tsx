import * as anchor from "@project-serum/anchor";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  SimpleGrid,
  Skeleton,
  Spinner,
} from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { useForm, useWatch, Control } from "react-hook-form";
import { IoAnalytics, IoCalendar, IoPricetag } from "react-icons/io5";
import { NftResult } from "../../common/types";
import { useFloorPriceQuery, useMetadataFileQuery } from "../../hooks/query";
import {
  AskLoanMutationVariables,
  useAskLoanMutation,
} from "../../hooks/mutation/loan";
import { VerifiedCollection } from "../collection";
import {
  LoanFormFields,
  LoanForecast,
  ModalProps,
  SliderField,
  SelectNftForm,
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
          {innerSelected ? "Create Ask" : "Select NFT"}
        </ModalHeader>
        {innerSelected ? (
          <AskLoanForm
            isLoading={mutation.isLoading}
            selected={innerSelected}
            onRequestClose={onRequestClose}
            onCancel={() => setSelected(null)}
            onSubmit={(vars) => mutation.mutate(vars)}
          />
        ) : (
          <SelectNftForm onSelect={setSelected} />
        )}
      </ModalContent>
    </Modal>
  );
};

interface AskLoanFormProps extends Pick<ModalProps, "onRequestClose"> {
  isLoading: boolean;
  selected: NftResult;
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

  const [isVisible, setVisible] = useState(false);
  const floorPriceQuery = useFloorPriceQuery(selected?.metadata.data.symbol);
  const metadataQuery = useMetadataFileQuery(selected?.metadata?.data.uri);

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
            <Box pb="4" pt="6" pl="6" pr="6">
              <Flex width="100%" gap="4">
                <Flex flex={1}>
                  <Box
                    h="36"
                    w="36"
                    position="relative"
                    borderRadius="sm"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      left="0"
                      top="0"
                      right="0"
                      bottom="0"
                    >
                      <Skeleton
                        height="100%"
                        width="100%"
                        isLoaded={metadataQuery.data?.image && isVisible}
                      >
                        {metadataQuery.data?.image && (
                          <Image
                            quality={100}
                            layout="fill"
                            objectFit="cover"
                            src={metadataQuery.data?.image}
                            alt={selected?.metadata.data.name}
                            onLoad={() => setVisible(true)}
                          />
                        )}
                      </Skeleton>
                    </Box>
                  </Box>
                </Flex>
                <Flex flex={3} flexGrow={1}>
                  <Box w="100%">
                    <Box pb="4">
                      <Heading size="md">
                        {selected?.metadata.data.name}
                      </Heading>
                      <VerifiedCollection
                        size="xs"
                        metadata={selected?.metadata}
                      />
                    </Box>
                    {floorPriceQuery.data?.floorPrice && (
                      <AskListingForecast
                        control={control}
                        floorPrice={floorPriceQuery.data?.floorPrice}
                      />
                    )}
                  </Box>
                </Flex>
              </Flex>
            </Box>
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
  const durationSeconds = new anchor.BN(duration * 86_400);
  const basisPoints = apy * 100;

  return (
    <LoanForecast
      amountLabel="Lending"
      amount={amount}
      basisPoints={basisPoints}
      duration={durationSeconds}
    />
  );
};
