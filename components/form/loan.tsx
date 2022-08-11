import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
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
import {
  IoAnalytics,
  IoCalendar,
  IoPricetag,
  IoArrowForwardCircle,
} from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../common/utils";
import { useFloorPriceQuery } from "../../hooks/query";
import { useInitLoanMutation } from "../../hooks/mutation/loan";

interface FormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface ListingFormProps {
  open: boolean;
  mint: anchor.web3.PublicKey | undefined;
  depositTokenAccount: anchor.web3.PublicKey | undefined;
  symbol: string | undefined;
  onRequestClose: () => void;
}

export const InitLoanModal = ({
  open,
  mint,
  depositTokenAccount,
  symbol,
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

  const floorPriceQuery = useFloorPriceQuery(symbol);

  const mutation = useInitLoanMutation(() => onRequestClose());

  function onSubmit() {
    handleSubmit((data) => {
      if (floorPriceQuery.data) {
        const options = {
          amount: (data.ltv / 100) * floorPriceQuery.data.floorPrice,
          basisPoints: data.apy * 100,
          duration: data.duration * 24 * 60 * 60,
        };

        if (mint && depositTokenAccount && symbol) {
          mutation.mutate({
            options,
            mint,
            depositTokenAccount,
          });
        }
      }
    })();
  }

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
                      min={5}
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
          Interest
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
