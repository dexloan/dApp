import { useState } from "react";
import { Control, Controller, useForm } from "react-hook-form";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Box,
  Badge,
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

interface FormFields {
  ltv: number;
  apy: number;
  duration: number;
}

interface ListingFormProps {
  onSubmit: (data: FormFields) => void;
}

export const ListingForm = ({ onSubmit }: ListingFormProps) => {
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
      <Box>
        <Text></Text>
      </Box>
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
          />

          <FormField
            name="apy"
            control={control}
            label="APY"
            defaultValue={50}
            min={0}
            max={1000}
            step={5}
            icon={IoAnalytics}
          />

          <FormField
            name="duration"
            control={control}
            label="Duration"
            defaultValue={30}
            min={1}
            max={365}
            icon={IoCalendar}
          />
        </FormControl>
      </form>
    </>
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
            <SliderTrack bg="red.100">
              <SliderFilledTrack bg="tomato" />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="teal.500"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${value}%`}
            >
              <SliderThumb boxSize={6}>
                <Box color="tomato" as={icon} />
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
