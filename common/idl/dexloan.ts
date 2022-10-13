export type DexloanListings = {
  version: "1.0.0";
  name: "dexloan_listings";
  instructions: [
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
          docs: ["Misc"];
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
          type: "u32";
        },
        {
          name: "duration";
          type: "i64";
        }
      ];
    },
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
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["Misc"];
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
          type: "u32";
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
          docs: ["Misc"];
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
      name: "repossessWithHire";
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
          name: "hire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
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
          docs: ["Misc"];
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
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["Misc"];
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
          docs: ["Misc"];
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
          name: "bidId";
          type: "u8";
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
          docs: ["The listing the loan is being issued against"];
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
          docs: ["Misc"];
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
          docs: ["Misc"];
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
      name: "exerciseCallOptionWithHire";
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
          name: "hire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
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
          docs: ["Misc"];
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
          docs: ["The listing the loan is being issued against"];
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
          docs: ["Misc"];
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
      name: "initHire";
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
          name: "hire";
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
          docs: ["Misc"];
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
            defined: "HireArgs";
          };
        }
      ];
    },
    {
      name: "takeHire";
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
          name: "hire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireTokenAccount";
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
          docs: ["Misc"];
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
      name: "extendHire";
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
          name: "hire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
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
          docs: ["Misc"];
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
      name: "recoverHire";
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
          name: "hireTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
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
          docs: ["Misc"];
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
      name: "withdrawFromHireEscrow";
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
          name: "hire";
          isMut: true;
          isSigner: false;
          docs: ["The listing the loan is being issued against"];
        },
        {
          name: "hireEscrow";
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
          docs: ["Misc"];
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
      name: "closeHire";
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
          name: "hire";
          isMut: true;
          isSigner: false;
          docs: ["The listing the loan is being issued against"];
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
          docs: ["Misc"];
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
      args: [];
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
            docs: ["Whether the option is active"];
            type: {
              defined: "CallOptionState";
            };
          },
          {
            name: "amount";
            docs: ["The cost of the call option"];
            type: "u64";
          },
          {
            name: "seller";
            docs: ["The issuer of the call option"];
            type: "publicKey";
          },
          {
            name: "buyer";
            docs: ["The buyer of the call option"];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "expiry";
            docs: ["Duration of the loan in seconds"];
            type: "i64";
          },
          {
            name: "strikePrice";
            docs: ["The start date of the loan"];
            type: "u64";
          },
          {
            name: "mint";
            docs: ["The mint of the token being used for collateral"];
            type: "publicKey";
          },
          {
            name: "tokenMint";
            docs: ["(Optional) The mint of the spl-token mint"];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            docs: ["Misc"];
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
            docs: ["The buyer making the offer"];
            type: "publicKey";
          },
          {
            name: "expiry";
            docs: ["Duration of the loan in seconds"];
            type: "i64";
          },
          {
            name: "strikePrice";
            docs: ["The start date of the loan"];
            type: "u64";
          },
          {
            name: "amount";
            docs: ["The cost of the call option"];
            type: "u64";
          },
          {
            name: "collection";
            docs: ["The collection"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["misc"];
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
            name: "reserved";
            type: {
              array: ["u8", 128];
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
      name: "hire";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            docs: ["Whether the loan is active"];
            type: {
              defined: "HireState";
            };
          },
          {
            name: "amount";
            docs: ["The daily cost to hire"];
            type: "u64";
          },
          {
            name: "lender";
            docs: ["The NFT lender"];
            type: "publicKey";
          },
          {
            name: "borrower";
            docs: ["The NFT borrower"];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "expiry";
            docs: ["The latest date this NFT may be hired until"];
            type: "i64";
          },
          {
            name: "currentStart";
            docs: ["The start date of the current hire"];
            type: {
              option: "i64";
            };
          },
          {
            name: "currentExpiry";
            docs: ["The end date of the current hire"];
            type: {
              option: "i64";
            };
          },
          {
            name: "escrowBalance";
            docs: ["Any amount withheld in escrow"];
            type: "u64";
          },
          {
            name: "mint";
            docs: ["The mint of the token being used for collateral,"];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["Misc"];
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
            docs: ["Whether the loan is active"];
            type: {
              defined: "LoanState";
            };
          },
          {
            name: "amount";
            docs: ["The amount of the loan"];
            type: {
              option: "u64";
            };
          },
          {
            name: "outstanding";
            docs: ["The amount outstanding"];
            type: "u64";
          },
          {
            name: "threshold";
            docs: ["The liquidation threshold in basis points"];
            type: {
              option: "u32";
            };
          },
          {
            name: "borrower";
            docs: ["The NFT holder"];
            type: "publicKey";
          },
          {
            name: "lender";
            docs: ["The issuer of the loan"];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "basisPoints";
            docs: ["Annual percentage yield"];
            type: "u32";
          },
          {
            name: "installments";
            docs: ["Number of installments"];
            type: "u8";
          },
          {
            name: "currentInstallment";
            docs: ["Current installment"];
            type: "u8";
          },
          {
            name: "noticeIssued";
            docs: ["Notice issued ts"];
            type: {
              option: "i64";
            };
          },
          {
            name: "duration";
            docs: ["Duration of the loan in seconds"];
            type: "i64";
          },
          {
            name: "startDate";
            docs: ["The start date of the loan"];
            type: {
              option: "i64";
            };
          },
          {
            name: "mint";
            docs: ["The mint of the token being used for collateral"];
            type: "publicKey";
          },
          {
            name: "tokenMint";
            docs: ["The mint of the spl-token mint"];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            docs: ["misc"];
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
            docs: ["id of the offer"];
            type: "u8";
          },
          {
            name: "lender";
            docs: ["The lender making the offer"];
            type: "publicKey";
          },
          {
            name: "amount";
            docs: ["The amount of the loan"];
            type: {
              option: "u64";
            };
          },
          {
            name: "basisPoints";
            docs: ["Annual percentage yield"];
            type: "u32";
          },
          {
            name: "duration";
            docs: ["Duration of the loan in seconds"];
            type: "i64";
          },
          {
            name: "collection";
            docs: ["The collection"];
            type: "publicKey";
          },
          {
            name: "ltv";
            docs: ["The loan to floor-value of the offer"];
            type: {
              option: "u32";
            };
          },
          {
            name: "threshold";
            docs: ["The liquidation threshold in basis points"];
            type: {
              option: "u32";
            };
          },
          {
            name: "bump";
            docs: ["misc"];
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
            docs: ["Misc"];
            type: "u8";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "HireArgs";
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
            name: "hire";
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
      name: "HireState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Listed";
          },
          {
            name: "Hired";
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
          docs: ["Misc"],
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
          type: "u32",
        },
        {
          name: "duration",
          type: "i64",
        },
      ],
    },
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
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["Misc"],
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
          type: "u32",
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
          docs: ["Misc"],
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
      name: "repossessWithHire",
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
          name: "hire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
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
          docs: ["Misc"],
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
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["Misc"],
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
          docs: ["Misc"],
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
          name: "bidId",
          type: "u8",
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
          docs: ["The listing the loan is being issued against"],
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
          docs: ["Misc"],
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
          docs: ["Misc"],
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
      name: "exerciseCallOptionWithHire",
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
          name: "hire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
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
          docs: ["Misc"],
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
          docs: ["The listing the loan is being issued against"],
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
          docs: ["Misc"],
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
      name: "initHire",
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
          name: "hire",
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
          docs: ["Misc"],
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
            defined: "HireArgs",
          },
        },
      ],
    },
    {
      name: "takeHire",
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
          name: "hire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireTokenAccount",
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
          docs: ["Misc"],
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
      name: "extendHire",
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
          name: "hire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
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
          docs: ["Misc"],
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
      name: "recoverHire",
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
          name: "hireTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
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
          docs: ["Misc"],
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
      name: "withdrawFromHireEscrow",
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
          name: "hire",
          isMut: true,
          isSigner: false,
          docs: ["The listing the loan is being issued against"],
        },
        {
          name: "hireEscrow",
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
          docs: ["Misc"],
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
      name: "closeHire",
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
          name: "hire",
          isMut: true,
          isSigner: false,
          docs: ["The listing the loan is being issued against"],
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
          docs: ["Misc"],
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
      args: [],
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
            docs: ["Whether the option is active"],
            type: {
              defined: "CallOptionState",
            },
          },
          {
            name: "amount",
            docs: ["The cost of the call option"],
            type: "u64",
          },
          {
            name: "seller",
            docs: ["The issuer of the call option"],
            type: "publicKey",
          },
          {
            name: "buyer",
            docs: ["The buyer of the call option"],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "expiry",
            docs: ["Duration of the loan in seconds"],
            type: "i64",
          },
          {
            name: "strikePrice",
            docs: ["The start date of the loan"],
            type: "u64",
          },
          {
            name: "mint",
            docs: ["The mint of the token being used for collateral"],
            type: "publicKey",
          },
          {
            name: "tokenMint",
            docs: ["(Optional) The mint of the spl-token mint"],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            docs: ["Misc"],
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
            docs: ["The buyer making the offer"],
            type: "publicKey",
          },
          {
            name: "expiry",
            docs: ["Duration of the loan in seconds"],
            type: "i64",
          },
          {
            name: "strikePrice",
            docs: ["The start date of the loan"],
            type: "u64",
          },
          {
            name: "amount",
            docs: ["The cost of the call option"],
            type: "u64",
          },
          {
            name: "collection",
            docs: ["The collection"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["misc"],
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
            name: "reserved",
            type: {
              array: ["u8", 128],
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
      name: "hire",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            docs: ["Whether the loan is active"],
            type: {
              defined: "HireState",
            },
          },
          {
            name: "amount",
            docs: ["The daily cost to hire"],
            type: "u64",
          },
          {
            name: "lender",
            docs: ["The NFT lender"],
            type: "publicKey",
          },
          {
            name: "borrower",
            docs: ["The NFT borrower"],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "expiry",
            docs: ["The latest date this NFT may be hired until"],
            type: "i64",
          },
          {
            name: "currentStart",
            docs: ["The start date of the current hire"],
            type: {
              option: "i64",
            },
          },
          {
            name: "currentExpiry",
            docs: ["The end date of the current hire"],
            type: {
              option: "i64",
            },
          },
          {
            name: "escrowBalance",
            docs: ["Any amount withheld in escrow"],
            type: "u64",
          },
          {
            name: "mint",
            docs: ["The mint of the token being used for collateral,"],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["Misc"],
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
            docs: ["Whether the loan is active"],
            type: {
              defined: "LoanState",
            },
          },
          {
            name: "amount",
            docs: ["The amount of the loan"],
            type: {
              option: "u64",
            },
          },
          {
            name: "outstanding",
            docs: ["The amount outstanding"],
            type: "u64",
          },
          {
            name: "threshold",
            docs: ["The liquidation threshold in basis points"],
            type: {
              option: "u32",
            },
          },
          {
            name: "borrower",
            docs: ["The NFT holder"],
            type: "publicKey",
          },
          {
            name: "lender",
            docs: ["The issuer of the loan"],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "basisPoints",
            docs: ["Annual percentage yield"],
            type: "u32",
          },
          {
            name: "installments",
            docs: ["Number of installments"],
            type: "u8",
          },
          {
            name: "currentInstallment",
            docs: ["Current installment"],
            type: "u8",
          },
          {
            name: "noticeIssued",
            docs: ["Notice issued ts"],
            type: {
              option: "i64",
            },
          },
          {
            name: "duration",
            docs: ["Duration of the loan in seconds"],
            type: "i64",
          },
          {
            name: "startDate",
            docs: ["The start date of the loan"],
            type: {
              option: "i64",
            },
          },
          {
            name: "mint",
            docs: ["The mint of the token being used for collateral"],
            type: "publicKey",
          },
          {
            name: "tokenMint",
            docs: ["The mint of the spl-token mint"],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            docs: ["misc"],
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
            docs: ["id of the offer"],
            type: "u8",
          },
          {
            name: "lender",
            docs: ["The lender making the offer"],
            type: "publicKey",
          },
          {
            name: "amount",
            docs: ["The amount of the loan"],
            type: {
              option: "u64",
            },
          },
          {
            name: "basisPoints",
            docs: ["Annual percentage yield"],
            type: "u32",
          },
          {
            name: "duration",
            docs: ["Duration of the loan in seconds"],
            type: "i64",
          },
          {
            name: "collection",
            docs: ["The collection"],
            type: "publicKey",
          },
          {
            name: "ltv",
            docs: ["The loan to floor-value of the offer"],
            type: {
              option: "u32",
            },
          },
          {
            name: "threshold",
            docs: ["The liquidation threshold in basis points"],
            type: {
              option: "u32",
            },
          },
          {
            name: "bump",
            docs: ["misc"],
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
            docs: ["Misc"],
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "HireArgs",
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
            name: "hire",
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
      name: "HireState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Listed",
          },
          {
            name: "Hired",
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
