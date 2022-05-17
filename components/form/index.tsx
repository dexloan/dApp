import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import {
  FormLabel,
  FormControl,
  Badge,
  Box,
  Button,
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
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { IoAnalytics, IoCalendar, IoPricetag } from "react-icons/io5";
import { IconType } from "react-icons";
import * as utils from "../../utils";

interface FormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface ListingFormProps {
  floorPrice: anchor.BN | null;
  onSubmit: (data: FormFields) => void;
}

export const ListingForm = ({ floorPrice, onSubmit }: ListingFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues: {
      ltv: 60,
      apy: 50,
      duration: 30,
    },
  });

  return (
    <>
      <ListingForecast control={control} floorPrice={floorPrice} />
      <form onSubmit={handleSubmit(onSubmit)}>
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
    </>
  );
};

interface ListingForecastProps {
  control: Control<FormFields, any>;
  floorPrice: anchor.BN | null;
}

const ListingForecast = ({ control, floorPrice }: ListingForecastProps) => {
  const { ltv, apy, duration } = useWatch({ control });

  if (!ltv || !apy || !duration || !floorPrice) return null;

  const amount = new anchor.BN((ltv / 100) * floorPrice.toNumber());

  const interest = utils.calculateInterest(
    amount,
    new anchor.BN(duration * 24 * 60 * 60),
    apy * 100
  );

  return (
    <Box pb="8">
      <Badge fontSize="md" mr="2">
        Borrowing {utils.formatAmount(amount)}
      </Badge>
      <Badge fontSize="md">
        Interest due on maturity {utils.formatAmount(interest)}
      </Badge>
    </Box>
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

interface FormModalProps {
  children: React.ReactNode;
  header: React.ReactNode;
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  onRequestClose: () => void;
}

export const FormModal = ({
  children,
  header,
  isOpen,
  isLoading,
  onSubmit,
  onRequestClose,
}: FormModalProps) => {
  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onRequestClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="gray.700">{header}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            mr="2"
            isLoading={isLoading}
            colorScheme="green"
            onClick={onSubmit}
          >
            Confirm
          </Button>
          <Button
            variant="ghost"
            isDisabled={isLoading}
            onClick={onRequestClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
