import {
  Badge,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Text,
} from "@chakra-ui/react";
import { CallOption, Loan, Hire } from "../../common/model";

interface MutationDialogProps {
  open: boolean;
  header: React.ReactNode;
  content: React.ReactNode;
  loading: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export function MutationDialog({
  open,
  header,
  content,
  loading,
  onConfirm,
  onRequestClose,
}: MutationDialogProps) {
  return (
    <Modal
      size="lg"
      isOpen={open}
      onClose={() => {
        if (!loading) {
          onRequestClose();
        }
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="2xl" fontWeight="black">
          {header}
        </ModalHeader>
        <ModalBody>{content}</ModalBody>
        <ModalFooter>
          <Button
            mr="2"
            isLoading={loading}
            colorScheme="green"
            onClick={onConfirm}
          >
            Confirm
          </Button>
          <Button variant="ghost" isDisabled={loading} onClick={onRequestClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface LoanDialogProps
  extends Pick<
    MutationDialogProps,
    "open" | "loading" | "onConfirm" | "onRequestClose"
  > {
  loan: Loan;
}

export const LoanDialog: React.FC<LoanDialogProps> = ({
  loan,
  open,
  loading,
  onConfirm,
  onRequestClose,
}) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={<>Create Loan</>}
      content={
        <>
          <Text mb="4">
            <Badge fontSize="md" colorScheme="green">
              {loan.amount}
            </Badge>{" "}
            <Badge fontSize="md">{loan.data.basisPoints / 100}% APY</Badge>
          </Text>
          <Text mb="4">Loan will mature on {loan.dueDate}.</Text>
          <Text fontSize="sm">
            This loan may be repaid in full at any time. Interest will be
            calculated on a pro-rata basis at the time of repayment. If the
            borrower fails to repay the loan before the expiry date, you may
            exercise the right to repossess the NFT.
          </Text>
        </>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const CancelDialog: React.FC<
  Pick<MutationDialogProps, "open" | "loading" | "onConfirm" | "onRequestClose">
> = ({ open, loading, onConfirm, onRequestClose }) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Cancel Listing"}
      content={<Text>Do you wish to cancel this listing?</Text>}
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const RepayDialog: React.FC<LoanDialogProps> = ({
  loan,
  open,
  loading,
  onConfirm,
  onRequestClose,
}) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={<>Repay Loan</>}
      content={
        <>
          <Text mb="4">
            <Badge colorScheme="green" borderRadius="md" fontSize="md" mr="2">
              {loan.amount}
            </Badge>
            <Badge borderRadius="md" fontSize="md" mr="2">
              {loan.data.basisPoints / 100}% APY
            </Badge>
            <Badge colorScheme="blue" borderRadius="md" fontSize="md">
              {loan.interestDue}
            </Badge>
          </Text>
          <Text mb="4">
            Repay full loan amount of{" "}
            <Text as="span" fontWeight="semibold">
              {loan.totalDue}
            </Text>{" "}
            to recover your NFT.
          </Text>
          <Text fontSize="sm">
            This loan may be repaid in full at any time. Interest will be
            calculated on a pro-rata basis. If the borrower fails to repay the
            loan before the expiry date, you may exercise the right to repossess
            the NFT.
          </Text>
        </>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const RepossessDialog: React.FC<
  Pick<MutationDialogProps, "open" | "loading" | "onConfirm" | "onRequestClose">
> = ({ open, loading, onConfirm, onRequestClose }) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Repossess NFT"}
      content={
        <Text>
          Are you sure you wish to repossess the NFT? By doing so you will not
          be able to receive repayment of the outstanding amount.
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const CloseAccountDialog: React.FC<
  Pick<MutationDialogProps, "open" | "loading" | "onConfirm" | "onRequestClose">
> = ({ open, loading, onConfirm, onRequestClose }) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Close listing account"}
      content={<Text>Close listing account to recover rent?</Text>}
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

interface CallOptionDialogProps
  extends Pick<
    MutationDialogProps,
    "open" | "loading" | "onConfirm" | "onRequestClose"
  > {
  callOption: CallOption;
}

export const BuyCallOptionDialog = ({
  callOption,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: CallOptionDialogProps) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Buy call option"}
      content={
        <>
          <Text mb="4">
            <Badge colorScheme="green" borderRadius="md" fontSize="md" mr="2">
              {callOption.strikePrice}
            </Badge>
            <Badge borderRadius="md" fontSize="md" mr="2">
              {callOption.cost}
            </Badge>
          </Text>
          <Text mb="4">
            Option will expire on {callOption.expiryLongFormat}
          </Text>
          <Text mb="4" fontSize="sm">
            This option gives you the right to purchase{" "}
            {callOption.metadata.data.name} at the price of{" "}
            {callOption.strikePrice} anytime before the expiry time. The cost to
            purchase this option is {callOption.cost}.
          </Text>
        </>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const ExerciseDialog = ({
  callOption,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: CallOptionDialogProps) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Exercise call option"}
      content={
        <Text>
          Exercise option to buy {callOption.metadata.data.name} for{" "}
          {callOption.strikePrice}?
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const CloseCallOptionDialog = ({
  callOption,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: CallOptionDialogProps) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={"Cancel listing"}
      content={
        <Text>
          Close call option listing
          {callOption.hasBuyer ? " and recover NFT from escrow" : ""}?
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

interface HireDialogProps
  extends Pick<
    MutationDialogProps,
    "open" | "loading" | "onConfirm" | "onRequestClose"
  > {
  days: number;
  hire: Hire;
}

export const HireDialog = ({
  hire,
  days,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: HireDialogProps) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={`Hire for ${days} day${days > 1 ? "s" : ""}`}
      content={
        <Text>
          Hire ${hire.metadata.data.name} for ${days} day${days > 1 ? "s" : ""}{" "}
          at a cost of ${hire.getFullAmount(days)}?
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};
