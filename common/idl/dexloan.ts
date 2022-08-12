export type DexloanListings = {
  version: "1.0.0";
  name: "dexloan_listings";
  instructions: [
    {
      name: "initLoan";
      accounts: [
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
      name: "initLoanWithHire";
      accounts: [
        {
          name: "borrower";
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
          name: "hire";
          isMut: false;
          isSigner: false;
        },
        {
          name: "hireBorrower";
          isMut: false;
          isSigner: false;
        },
        {
          name: "hireTokenAccount";
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
      name: "closeLoan";
      accounts: [
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
      name: "giveLoan";
      accounts: [
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
      name: "initCallOption";
      accounts: [
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
      name: "initCallOptionWithHire";
      accounts: [
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
          name: "hire";
          isMut: false;
          isSigner: false;
        },
        {
          name: "hireBorrower";
          isMut: false;
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
      name: "exerciseCallOption";
      accounts: [
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
          isMut: false;
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
      name: "exerciseCallOptionWithHire";
      accounts: [
        {
          name: "seller";
          isMut: true;
          isSigner: false;
        },
        {
          name: "borrower";
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
          name: "hireBorrower";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hireEscrow";
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
      name: "initHire";
      accounts: [
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
          name: "lender";
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
      name: "closeHire";
      accounts: [
        {
          name: "lender";
          isMut: true;
          isSigner: true;
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
            name: "seller";
            type: "publicKey";
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
            name: "mint";
            type: "publicKey";
          },
          {
            name: "padding";
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
      name: "hire";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            type: {
              defined: "HireState";
            };
          },
          {
            name: "amount";
            type: "u64";
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
            name: "amount";
            type: "u64";
          },
          {
            name: "borrower";
            type: "publicKey";
          },
          {
            name: "lender";
            type: "publicKey";
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
            name: "startDate";
            type: "i64";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "padding";
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
      name: "MetadataDoesntExist";
      msg: "Metadata doesnt exist";
    },
    {
      code: 6008;
      name: "DerivedKeyInvalid";
      msg: "Derived key invalid";
    },
    {
      code: 6009;
      name: "OptionNotExpired";
      msg: "Option not expired";
    },
    {
      code: 6010;
      name: "NumericalOverflow";
      msg: "Numerical overflow";
    },
    {
      code: 6011;
      name: "BorrowerNotSpecified";
      msg: "Borrower not specified";
    },
    {
      code: 6012;
      name: "InvalidEscrowBalance";
      msg: "Invalid escrow balance";
    },
    {
      code: 6013;
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
      name: "initLoan",
      accounts: [
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
      name: "initLoanWithHire",
      accounts: [
        {
          name: "borrower",
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
          name: "hire",
          isMut: false,
          isSigner: false,
        },
        {
          name: "hireBorrower",
          isMut: false,
          isSigner: false,
        },
        {
          name: "hireTokenAccount",
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
      name: "closeLoan",
      accounts: [
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
      name: "giveLoan",
      accounts: [
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
      name: "initCallOption",
      accounts: [
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
      name: "initCallOptionWithHire",
      accounts: [
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
          name: "hire",
          isMut: false,
          isSigner: false,
        },
        {
          name: "hireBorrower",
          isMut: false,
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
      name: "exerciseCallOption",
      accounts: [
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
          isMut: false,
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
      name: "exerciseCallOptionWithHire",
      accounts: [
        {
          name: "seller",
          isMut: true,
          isSigner: false,
        },
        {
          name: "borrower",
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
          name: "hireBorrower",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hireEscrow",
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
      name: "initHire",
      accounts: [
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
          name: "lender",
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
      name: "closeHire",
      accounts: [
        {
          name: "lender",
          isMut: true,
          isSigner: true,
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
            name: "seller",
            type: "publicKey",
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
            name: "mint",
            type: "publicKey",
          },
          {
            name: "padding",
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
      name: "hire",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            type: {
              defined: "HireState",
            },
          },
          {
            name: "amount",
            type: "u64",
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
            name: "amount",
            type: "u64",
          },
          {
            name: "borrower",
            type: "publicKey",
          },
          {
            name: "lender",
            type: "publicKey",
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
            name: "startDate",
            type: "i64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "padding",
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
      name: "MetadataDoesntExist",
      msg: "Metadata doesnt exist",
    },
    {
      code: 6008,
      name: "DerivedKeyInvalid",
      msg: "Derived key invalid",
    },
    {
      code: 6009,
      name: "OptionNotExpired",
      msg: "Option not expired",
    },
    {
      code: 6010,
      name: "NumericalOverflow",
      msg: "Numerical overflow",
    },
    {
      code: 6011,
      name: "BorrowerNotSpecified",
      msg: "Borrower not specified",
    },
    {
      code: 6012,
      name: "InvalidEscrowBalance",
      msg: "Invalid escrow balance",
    },
    {
      code: 6013,
      name: "InvalidDelegate",
      msg: "Invalid token account delegate",
    },
  ],
};
