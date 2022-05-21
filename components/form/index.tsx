import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Heading,
  Flex,
  FormLabel,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  IoAnalytics,
  IoCalendar,
  IoPricetag,
  IoArrowForwardCircle,
} from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../utils";
import { NFTResult } from "../../common/types";
import { createListing } from "../../common/actions";
import { useFloorPriceQuery } from "../../hooks/query";

interface FormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface ListingFormProps {
  selected: NFTResult | null;
  onRequestClose: () => void;
}

export const ListingModal = ({
  selected,
  onRequestClose,
}: ListingFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues: {
      ltv: 60,
      apy: 50,
      duration: 30,
    },
  });

  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const queryClient = useQueryClient();
  const floorPriceQuery = useFloorPriceQuery(selected?.metadata.data.symbol);

  const mutation = useMutation(
    (variables: FormFields) => {
      if (
        anchorWallet &&
        floorPriceQuery.data?.floorPrice &&
        selected?.tokenAccount.data.mint &&
        selected?.tokenAccount.pubkey
      ) {
        const listingOptions = {
          amount: (variables.ltv / 100) * floorPriceQuery.data?.floorPrice,
          basisPoints: variables.apy * 100,
          duration: variables.duration * 24 * 60 * 60,
        };

        return createListing(
          connection,
          anchorWallet,
          selected.tokenAccount.data.mint,
          selected.tokenAccount.pubkey,
          listingOptions
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error("Error: " + err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      onSuccess() {
        toast.success("Listing created");

        queryClient.setQueryData<NFTResult[]>(
          ["wallet-nfts", anchorWallet?.publicKey.toBase58()],
          (data) => {
            if (!data) {
              return [];
            }
            return data.filter(
              (item: NFTResult) =>
                item?.tokenAccount.pubkey !== selected?.tokenAccount.pubkey
            );
          }
        );

        onRequestClose();
      },
    }
  );

  function onSubmit() {
    handleSubmit((data) => {
      mutation.mutate(data);
    })();
  }

  return (
    <Modal size="3xl" isOpen={Boolean(selected)} onClose={onRequestClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="2xl" fontWeight="black">
          Create Listing
        </ModalHeader>
        <ModalBody>
          {floorPriceQuery.data?.floorPrice === undefined ? (
            <Spinner colorScheme="green" size="sm" thickness="4px" />
          ) : (
            <>
              {floorPriceQuery.data?.floorPrice && (
                <ListingForecast
                  control={control}
                  floorPrice={floorPriceQuery.data?.floorPrice}
                />
              )}
              <Box pb="4" pt="6" pl="6" pr="6" bg="gray.50" borderRadius="md">
                <form onSubmit={onSubmit}>
                  <FormControl isInvalid={!isValid}>
                    <FormField
                      name="ltv"
                      control={control}
                      label="Loan to value"
                      defaultValue={60}
                      min={10}
                      max={100}
                      step={5}
                      icon={IoPricetag}
                      units="%"
                    />

                    <FormField
                      name="apy"
                      control={control}
                      label="APY"
                      defaultValue={50}
                      min={1}
                      max={1000}
                      step={5}
                      icon={IoAnalytics}
                      units="%"
                    />

                    <FormField
                      name="duration"
                      control={control}
                      label="Duration"
                      defaultValue={30}
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

interface ListingForecastProps {
  control: Control<FormFields, any>;
  floorPrice: number;
}

const ListingForecast = ({ control, floorPrice }: ListingForecastProps) => {
  const { ltv, apy, duration } = useWatch({ control });

  if (!ltv || !apy || !duration) return null;

  const amount = new anchor.BN((ltv / 100) * floorPrice);

  const interest = utils.calculateInterestOnMaturity(
    amount,
    new anchor.BN(duration * 24 * 60 * 60),
    apy * 100
  );

  return (
    <Flex
      direction="row"
      gap="4"
      align="center"
      justify="space-between"
      p={{ base: "0", md: "6" }}
      wrap="wrap"
    >
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.500">
          Borrowing
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {utils.formatAmount(amount)}
        </Heading>
      </Box>
      <Box
        size="2rem"
        as={IoArrowForwardCircle}
        mb="2"
        display={{ base: "none", md: "block" }}
      />
      <Box>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.500"
          whiteSpace="nowrap"
        >
          Duration
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {duration} days
        </Heading>
      </Box>
      <Box
        size="2rem"
        as={IoArrowForwardCircle}
        mb="2"
        display={{ base: "none", md: "block" }}
      />
      <Box>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.500"
          whiteSpace="nowrap"
        >
          Interest on maturity
        </Text>
        <Heading size="md" fontWeight="bold" mb="6" whiteSpace="nowrap">
          {utils.formatAmount(interest)}
        </Heading>
      </Box>
    </Flex>
  );
};

interface FormFieldProps {
  name: keyof FormFields;
  control: Control<FormFields, any>;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  icon: IconType;
  units: string;
}

const FormField = ({
  name,
  control,
  label,
  defaultValue,
  min,
  max,
  step,
  icon,
  units,
}: FormFieldProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box pb="6">
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        rules={{
          required: true,
        }}
        render={({ field: { value, onChange } }) => (
          <Slider
            id={name}
            aria-label={label}
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={step}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onChange={(value) => onChange(value)}
          >
            <SliderTrack bg="green.100">
              <SliderFilledTrack bg="green" />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="green.500"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${value} ${units}`}
            >
              <SliderThumb boxSize={6}>
                <Box color="green" as={icon} />
              </SliderThumb>
            </Tooltip>
          </Slider>
        )}
      />
    </Box>
  );
};
