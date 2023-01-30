import { useMemo } from "react";

import * as utils from "../../common/utils";
import {
  GroupedLoanOfferJson,
  LoanJson,
  LoanOfferJson,
} from "../../common/types";
import { EllipsisProgress } from "../../components/progress";

export function useLTV(loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson) {
  return useMemo(() => {
    const amount = loan?.amount;
    const floorPrice = loan?.Collection.floorPrice;

    if (amount && floorPrice) {
      const percentage = (
        (utils.hexToNumber(amount) / utils.hexToNumber(floorPrice)) *
        100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }, [loan]);
}

export function useIsExpired(loan?: LoanJson) {
  return useMemo(() => {
    if (loan?.startDate) {
      const now = BigInt(Date.now() / 1000);
      const expiresAt = BigInt(loan.startDate) + BigInt(loan.duration);
      return now > expiresAt;
    }
    return false;
  }, [loan?.duration, loan?.startDate]);
}

export function useAmpuntOnMaturity(
  loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson
) {
  return useMemo(() => {
    if (loan && loan?.amount) {
      const amount = BigInt(loan.amount);
      const duration = BigInt(loan.duration);
      const lenderBasisPoints = loan?.basisPoints;
      const creatorBasisPoints =
        "creatorBasisPoints" in loan
          ? loan.creatorBasisPoints ?? loan.Collection.loanBasisPoints
          : loan.Collection.loanBasisPoints;

      return utils.formatAmount(
        utils.calculateAmountOnMaturity(
          amount,
          duration,
          lenderBasisPoints + creatorBasisPoints
        )
      );
    }

    return <EllipsisProgress />;
  }, [loan]);
}

interface UseDueDateProps {
  loan?: LoanJson;
  displayTime?: boolean;
}

export function useDueDate({ loan, displayTime = false }: UseDueDateProps) {
  return useMemo(() => {
    if (loan) {
      const date = utils.getDueDate(
        loan.startDate ? BigInt(loan.startDate) : BigInt(Date.now() / 1000),
        BigInt(loan.duration)
      );

      return (
        date.format("MMM D, YYYY") +
        (displayTime ? ` at ${date.format("h:mm A z")}` : "")
      );
    }

    return <EllipsisProgress />;
  }, [loan, displayTime]);
}

export function useAPY(loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson) {
  return useMemo(() => {
    if (loan) {
      const lenderBasisPoints = loan.basisPoints;
      const creatorBasisPoints =
        "creatorBasisPoints" in loan
          ? loan.creatorBasisPoints
          : loan.Collection.loanBasisPoints;

      const lender = utils.basisPointsToPercent(lenderBasisPoints);
      const creator = utils.basisPointsToPercent(creatorBasisPoints);
      const total = utils.basisPointsToPercent(
        lenderBasisPoints + creatorBasisPoints
      );
      return {
        lender,
        creator,
        total,
      };
    }

    return {
      lender: null,
      creator: null,
      total: null,
    };
  }, [loan]);
}

export function useAmount(
  loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson
) {
  return useMemo(() => {
    if (loan?.amount) {
      return utils.formatHexAmount(loan.amount);
    }

    return null;
  }, [loan]);
}

export function useDuration(
  loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson
) {
  return useMemo(() => {
    if (loan?.duration) {
      return utils.formatHexDuration(loan.duration);
    }

    return <EllipsisProgress />;
  }, [loan]);
}

export function useFloorPrice(
  loan?: LoanJson | LoanOfferJson | GroupedLoanOfferJson
) {
  return useMemo(() => {
    const floorPrice = loan?.Collection.floorPrice;

    if (floorPrice) {
      return utils.formatHexAmount(floorPrice);
    }

    return null;
  }, [loan]);
}
