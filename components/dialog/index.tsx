import {
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Text,
} from "@chakra-ui/react";
import { Rental } from "../../common/model";
import { LoanJson } from "../../common/types";
import {
  useAmount,
  useAPY,
  useDueDate,
  useInterestDue,
  useTotalDue,
} from "../../hooks/render";

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
            variant="primary"
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
  loan: LoanJson;
}

export const LoanDialog: React.FC<LoanDialogProps> = ({
  loan,
  open,
  loading,
  onConfirm,
  onRequestClose,
}) => {
  const apy = useAPY(loan);
  const amount = useAmount(loan);
  const interestDue = useInterestDue(loan);
  const dueDate = useDueDate({ loan });

  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={<>Give Loan</>}
      content={
        <>
          <Text mb="4">
            <Badge fontSize="md" colorScheme="green">
              {amount}
            </Badge>{" "}
            <Badge fontSize="md" colorScheme="teal">
              {interestDue}
            </Badge>{" "}
            <Badge fontSize="md">{apy.total} APY</Badge>{" "}
          </Text>
          <Text mb="4">Loan will mature on {dueDate}.</Text>
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
  const apy = useAPY(loan);
  const amount = useAmount(loan);
  const interestDue = useInterestDue(loan);
  const totalDue = useTotalDue(loan);

  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={<>Repay Loan</>}
      content={
        <>
          <Text mb="4">
            <Badge colorScheme="green" borderRadius="md" fontSize="md" mr="2">
              {amount}
            </Badge>
            <Badge borderRadius="md" fontSize="md" mr="2">
              {apy.total} APY
            </Badge>
            <Badge colorScheme="blue" borderRadius="md" fontSize="md">
              {interestDue}
            </Badge>
          </Text>
          <Text mb="4">
            Repay full loan amount of{" "}
            <Text as="span" fontWeight="semibold">
              {totalDue}
            </Text>{" "}
            to unlock your NFT.
          </Text>
          <Text fontSize="sm">
            This loan may be repaid in full at any time. Failure to repay the
            loan before the maturity date may result in repossession of the NFT
            by the lender.
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
            <strong>{callOption.strikePrice}</strong> anytime before the expiry
            time. The cost to purchase this option is{" "}
            <strong>{callOption.cost}</strong>.
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
      header="Exercise call option"
      content={
        <Text>
          Exercise option to buy {callOption.metadata.data.name} for{" "}
          <strong>{callOption.strikePrice}</strong>?
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

interface RentalDialogProps
  extends Pick<
    MutationDialogProps,
    "open" | "loading" | "onConfirm" | "onRequestClose"
  > {
  rental: Rental;
}

export const TakeRentalDialog = ({
  rental,
  days,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: RentalDialogProps & {
  days: number;
}) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header="Rental"
      content={
        <Text>
          Rent {rental.metadata.data.name} for {days} day{days > 1 ? "s" : ""}{" "}
          at a cost of <strong>{rental.getFullAmount(days)}</strong>?
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const ExtendRentalDialog = ({
  rental,
  days,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: RentalDialogProps & {
  days: number;
}) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header="Extend rental"
      content={
        <Text>
          Extend rental of <strong>{rental.metadata.data.name}</strong> for{" "}
          {days} day
          {days > 1 ? "s" : ""} at a cost of {rental.getFullAmount(days)}?
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};

export const RecoverRentalDialog = ({
  rental,
  open,
  loading,
  onConfirm,
  onRequestClose,
}: RentalDialogProps) => {
  return (
    <MutationDialog
      open={open}
      loading={loading}
      header={`Recover NFT`}
      content={
        <Text>
          The current rental period expired on {rental.currentExpiry}. Do you
          wish to take back possession of the NFT? The listing will remain
          active until closed or another user choses to take the rental.
        </Text>
      }
      onConfirm={onConfirm}
      onRequestClose={onRequestClose}
    />
  );
};
