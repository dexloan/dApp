export type DexloanListings = {
  version: "1.0.0";
  name: "dexloan_listings";
  instructions: [
    {
      name: "offerLoan";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanOffer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "basisPoints";
          type: "u16";
        },
        {
          name: "duration";
          type: "i64";
        },
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "takeLoanOffer";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loanOffer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "closeLoanOffer";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanOffer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "askLoan";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "basisPoints";
          type: "u16";
        },
        {
          name: "duration";
          type: "i64";
        }
      ];
    },
    {
      name: "giveLoan";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeLoan";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: false;
          isSigner: true;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "repayLoan";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "repossess";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lenderTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "repossessWithRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lenderTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loan";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "bidCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOptionBid";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "strikePrice";
          type: "u64";
        },
        {
          name: "expiry";
          type: "i64";
        },
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "closeCallOptionBid";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOptionBid";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "sellCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: true;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "callOptionBid";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowPaymentAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "id";
          type: "u8";
        }
      ];
    },
    {
      name: "askCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: true;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "strikePrice";
          type: "u64";
        },
        {
          name: "expiry";
          type: "i64";
        }
      ];
    },
    {
      name: "buyCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "exerciseCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "exerciseCallOptionWithRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeCallOption";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "seller";
          isMut: true;
          isSigner: true;
        },
        {
          name: "callOption";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RentalArgs";
          };
        }
      ];
    },
    {
      name: "takeRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "days";
          type: "u16";
        }
      ];
    },
    {
      name: "extendRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "days";
          type: "u16";
        }
      ];
    },
    {
      name: "recoverRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "borrower";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "withdrawFromRentalEscrow";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rentalEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeRental";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rental";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "edition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initCollection";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "collection";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "config";
          type: {
            defined: "Config";
          };
        }
      ];
    },
    {
      name: "updateCollection";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "collection";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "config";
          type: {
            defined: "Config";
          };
        }
      ];
    },
    {
      name: "closeCollection";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "collection";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "callOption";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            type: {
              defined: "CallOptionState";
            };
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "creatorBasisPoints";
            type: "u16";
          },
          {
            name: "seller";
            type: "publicKey";
          },
          {
            name: "buyer";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "expiry";
            type: "i64";
          },
          {
            name: "strikePrice";
            type: "u64";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "tokenMint";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "callOptionBid";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "u8";
          },
          {
            name: "buyer";
            type: "publicKey";
          },
          {
            name: "expiry";
            type: "i64";
          },
          {
            name: "strikePrice";
            type: "u64";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "collection";
            type: "publicKey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "escrowBump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "collection";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "config";
            type: {
              defined: "Config";
            };
          },
          {
            name: "reserved";
            type: {
              array: ["u8", 64];
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "loan";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            type: {
              defined: "LoanState";
            };
          },
          {
            name: "borrower";
            type: "publicKey";
          },
          {
            name: "lender";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "amount";
            type: {
              option: "u64";
            };
          },
          {
            name: "basisPoints";
            type: "u16";
          },
          {
            name: "creatorBasisPoints";
            type: "u16";
          },
          {
            name: "outstanding";
            type: "u64";
          },
          {
            name: "threshold";
            type: {
              option: "u32";
            };
          },
          {
            name: "installments";
            type: "u8";
          },
          {
            name: "currentInstallment";
            type: "u8";
          },
          {
            name: "noticeIssued";
            type: {
              option: "i64";
            };
          },
          {
            name: "duration";
            type: "i64";
          },
          {
            name: "startDate";
            type: {
              option: "i64";
            };
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "tokenMint";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "loanOffer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "u8";
          },
          {
            name: "lender";
            type: "publicKey";
          },
          {
            name: "amount";
            type: {
              option: "u64";
            };
          },
          {
            name: "basisPoints";
            type: "u16";
          },
          {
            name: "duration";
            type: "i64";
          },
          {
            name: "collection";
            type: "publicKey";
          },
          {
            name: "ltv";
            type: {
              option: "u32";
            };
          },
          {
            name: "threshold";
            type: {
              option: "u32";
            };
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "escrowBump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "rental";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            type: {
              defined: "RentalState";
            };
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "creatorBasisPoints";
            type: "u16";
          },
          {
            name: "lender";
            type: "publicKey";
          },
          {
            name: "borrower";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "expiry";
            type: "i64";
          },
          {
            name: "currentStart";
            type: {
              option: "i64";
            };
          },
          {
            name: "currentExpiry";
            type: {
              option: "i64";
            };
          },
          {
            name: "escrowBalance";
            type: "u64";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "escrowBump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "tokenManager";
      type: {
        kind: "struct";
        fields: [
          {
            name: "accounts";
            type: {
              defined: "AccountState";
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "RentalArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "expiry";
            type: "i64";
          },
          {
            name: "borrower";
            type: {
              option: "publicKey";
            };
          }
        ];
      };
    },
    {
      name: "Config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanEnabled";
            type: "bool";
          },
          {
            name: "loanBasisPoints";
            type: "u16";
          },
          {
            name: "optionEnabled";
            type: "bool";
          },
          {
            name: "optionBasisPoints";
            type: "u16";
          },
          {
            name: "rentalEnabled";
            type: "bool";
          },
          {
            name: "rentalBasisPoints";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "AccountState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loan";
            type: "bool";
          },
          {
            name: "callOption";
            type: "bool";
          },
          {
            name: "rental";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "CallOptionState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Listed";
          },
          {
            name: "Active";
          },
          {
            name: "Exercised";
          }
        ];
      };
    },
    {
      name: "LoanState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Unlisted";
          },
          {
            name: "Listed";
          },
          {
            name: "Active";
          },
          {
            name: "Defaulted";
          }
        ];
      };
    },
    {
      name: "RentalState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Listed";
          },
          {
            name: "Rented";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "NotOverdue";
      msg: "This loan is not overdue";
    },
    {
      code: 6001;
      name: "NotExpired";
      msg: "Not expired";
    },
    {
      code: 6002;
      name: "InvalidExpiry";
      msg: "Invalid expiry";
    },
    {
      code: 6003;
      name: "InvalidState";
      msg: "Invalid state";
    },
    {
      code: 6004;
      name: "InvalidListingType";
      msg: "Invalid listing type";
    },
    {
      code: 6005;
      name: "OptionExpired";
      msg: "Option expired";
    },
    {
      code: 6006;
      name: "InvalidMint";
      msg: "Invalid mint";
    },
    {
      code: 6007;
      name: "InvalidCollection";
      msg: "Invalid collection";
    },
    {
      code: 6008;
      name: "MetadataDoesntExist";
      msg: "Metadata doesnt exist";
    },
    {
      code: 6009;
      name: "DerivedKeyInvalid";
      msg: "Derived key invalid";
    },
    {
      code: 6010;
      name: "OptionNotExpired";
      msg: "Option not expired";
    },
    {
      code: 6011;
      name: "NumericalOverflow";
      msg: "Numerical overflow";
    },
    {
      code: 6012;
      name: "BorrowerNotSpecified";
      msg: "Borrower not specified";
    },
    {
      code: 6013;
      name: "InvalidEscrowBalance";
      msg: "Invalid escrow balance";
    },
    {
      code: 6014;
      name: "InvalidDelegate";
      msg: "Invalid token account delegate";
    }
  ];
};

export const IDL: DexloanListings = {
  version: "1.0.0",
  name: "dexloan_listings",
  instructions: [
    {
      name: "offerLoan",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanOffer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "basisPoints",
          type: "u16",
        },
        {
          name: "duration",
          type: "i64",
        },
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "takeLoanOffer",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loanOffer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "closeLoanOffer",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanOffer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "askLoan",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "basisPoints",
          type: "u16",
        },
        {
          name: "duration",
          type: "i64",
        },
      ],
    },
    {
      name: "giveLoan",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeLoan",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: false,
          isSigner: true,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "repayLoan",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "repossess",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lenderTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "repossessWithRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lenderTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loan",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "bidCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOptionBid",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "strikePrice",
          type: "u64",
        },
        {
          name: "expiry",
          type: "i64",
        },
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "closeCallOptionBid",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOptionBid",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "sellCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: true,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "callOptionBid",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "id",
          type: "u8",
        },
      ],
    },
    {
      name: "askCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "strikePrice",
          type: "u64",
        },
        {
          name: "expiry",
          type: "i64",
        },
      ],
    },
    {
      name: "buyCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "exerciseCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "exerciseCallOptionWithRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeCallOption",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: true,
        },
        {
          name: "callOption",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RentalArgs",
          },
        },
      ],
    },
    {
      name: "takeRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "days",
          type: "u16",
        },
      ],
    },
    {
      name: "extendRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "days",
          type: "u16",
        },
      ],
    },
    {
      name: "recoverRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "borrower",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "withdrawFromRentalEscrow",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rentalEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeRental",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rental",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "edition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initCollection",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "config",
          type: {
            defined: "Config",
          },
        },
      ],
    },
    {
      name: "updateCollection",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "config",
          type: {
            defined: "Config",
          },
        },
      ],
    },
    {
      name: "closeCollection",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "callOption",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            type: {
              defined: "CallOptionState",
            },
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "creatorBasisPoints",
            type: "u16",
          },
          {
            name: "seller",
            type: "publicKey",
          },
          {
            name: "buyer",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "expiry",
            type: "i64",
          },
          {
            name: "strikePrice",
            type: "u64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "tokenMint",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "callOptionBid",
      type: {
        kind: "struct",
        fields: [
          {
            name: "id",
            type: "u8",
          },
          {
            name: "buyer",
            type: "publicKey",
          },
          {
            name: "expiry",
            type: "i64",
          },
          {
            name: "strikePrice",
            type: "u64",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "collection",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "escrowBump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "collection",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "config",
            type: {
              defined: "Config",
            },
          },
          {
            name: "reserved",
            type: {
              array: ["u8", 64],
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "loan",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            type: {
              defined: "LoanState",
            },
          },
          {
            name: "borrower",
            type: "publicKey",
          },
          {
            name: "lender",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "amount",
            type: {
              option: "u64",
            },
          },
          {
            name: "basisPoints",
            type: "u16",
          },
          {
            name: "creatorBasisPoints",
            type: "u16",
          },
          {
            name: "outstanding",
            type: "u64",
          },
          {
            name: "threshold",
            type: {
              option: "u32",
            },
          },
          {
            name: "installments",
            type: "u8",
          },
          {
            name: "currentInstallment",
            type: "u8",
          },
          {
            name: "noticeIssued",
            type: {
              option: "i64",
            },
          },
          {
            name: "duration",
            type: "i64",
          },
          {
            name: "startDate",
            type: {
              option: "i64",
            },
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "tokenMint",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "loanOffer",
      type: {
        kind: "struct",
        fields: [
          {
            name: "id",
            type: "u8",
          },
          {
            name: "lender",
            type: "publicKey",
          },
          {
            name: "amount",
            type: {
              option: "u64",
            },
          },
          {
            name: "basisPoints",
            type: "u16",
          },
          {
            name: "duration",
            type: "i64",
          },
          {
            name: "collection",
            type: "publicKey",
          },
          {
            name: "ltv",
            type: {
              option: "u32",
            },
          },
          {
            name: "threshold",
            type: {
              option: "u32",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "escrowBump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "rental",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            type: {
              defined: "RentalState",
            },
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "creatorBasisPoints",
            type: "u16",
          },
          {
            name: "lender",
            type: "publicKey",
          },
          {
            name: "borrower",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "expiry",
            type: "i64",
          },
          {
            name: "currentStart",
            type: {
              option: "i64",
            },
          },
          {
            name: "currentExpiry",
            type: {
              option: "i64",
            },
          },
          {
            name: "escrowBalance",
            type: "u64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "escrowBump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "tokenManager",
      type: {
        kind: "struct",
        fields: [
          {
            name: "accounts",
            type: {
              defined: "AccountState",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "RentalArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "expiry",
            type: "i64",
          },
          {
            name: "borrower",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "Config",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanEnabled",
            type: "bool",
          },
          {
            name: "loanBasisPoints",
            type: "u16",
          },
          {
            name: "optionEnabled",
            type: "bool",
          },
          {
            name: "optionBasisPoints",
            type: "u16",
          },
          {
            name: "rentalEnabled",
            type: "bool",
          },
          {
            name: "rentalBasisPoints",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "AccountState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loan",
            type: "bool",
          },
          {
            name: "callOption",
            type: "bool",
          },
          {
            name: "rental",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "CallOptionState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Listed",
          },
          {
            name: "Active",
          },
          {
            name: "Exercised",
          },
        ],
      },
    },
    {
      name: "LoanState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Unlisted",
          },
          {
            name: "Listed",
          },
          {
            name: "Active",
          },
          {
            name: "Defaulted",
          },
        ],
      },
    },
    {
      name: "RentalState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Listed",
          },
          {
            name: "Rented",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NotOverdue",
      msg: "This loan is not overdue",
    },
    {
      code: 6001,
      name: "NotExpired",
      msg: "Not expired",
    },
    {
      code: 6002,
      name: "InvalidExpiry",
      msg: "Invalid expiry",
    },
    {
      code: 6003,
      name: "InvalidState",
      msg: "Invalid state",
    },
    {
      code: 6004,
      name: "InvalidListingType",
      msg: "Invalid listing type",
    },
    {
      code: 6005,
      name: "OptionExpired",
      msg: "Option expired",
    },
    {
      code: 6006,
      name: "InvalidMint",
      msg: "Invalid mint",
    },
    {
      code: 6007,
      name: "InvalidCollection",
      msg: "Invalid collection",
    },
    {
      code: 6008,
      name: "MetadataDoesntExist",
      msg: "Metadata doesnt exist",
    },
    {
      code: 6009,
      name: "DerivedKeyInvalid",
      msg: "Derived key invalid",
    },
    {
      code: 6010,
      name: "OptionNotExpired",
      msg: "Option not expired",
    },
    {
      code: 6011,
      name: "NumericalOverflow",
      msg: "Numerical overflow",
    },
    {
      code: 6012,
      name: "BorrowerNotSpecified",
      msg: "Borrower not specified",
    },
    {
      code: 6013,
      name: "InvalidEscrowBalance",
      msg: "Invalid escrow balance",
    },
    {
      code: 6014,
      name: "InvalidDelegate",
      msg: "Invalid token account delegate",
    },
  ],
};
