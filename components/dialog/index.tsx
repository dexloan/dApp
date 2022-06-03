import * as anchor from "@project-serum/anchor";
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
import * as utils from "../../utils";
import { start } from "repl";

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

interface LoanDialogProps {
  open: boolean;
  amount: anchor.BN;
  basisPoints: number;
  duration: anchor.BN;
  loading: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export const LoanDialog: React.FC<LoanDialogProps> = ({
  open,
  amount,
  basisPoints,
  duration,
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
              {utils.formatAmount(amount)}
            </Badge>{" "}
            <Badge fontSize="md">{basisPoints / 100}% APY</Badge>
          </Text>
          <Text mb="4">
            Loan will expire on{" "}
            {utils.formatDueDate(
              new anchor.BN(Math.floor(Date.now() / 1000)),
              duration
            )}
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

export const RepayDialog: React.FC<
  LoanDialogProps & { startDate: anchor.BN }
> = ({
  open,
  loading,
  amount,
  basisPoints,
  duration,
  startDate,
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
              {utils.formatAmount(amount)}
            </Badge>
            <Badge borderRadius="md" fontSize="md" mr="2">
              {basisPoints / 100}% APY
            </Badge>
            <Badge colorScheme="blue" borderRadius="md" fontSize="md">
              {utils.formatInterestDue(amount, startDate, basisPoints)}
            </Badge>
          </Text>
          <Text mb="4">
            Repay full loan amount of{" "}
            <Text as="span" fontWeight="semibold">
              {utils.formatTotalDue(amount, startDate, basisPoints)}
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
