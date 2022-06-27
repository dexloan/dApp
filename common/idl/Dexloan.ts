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
          name: "loanAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          type: "u64";
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
          name: "loanAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          name: "loanAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          name: "escrowAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loanAccount";
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
      name: "repossessCollateral";
      accounts: [
        {
          name: "escrowAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lenderTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loanAccount";
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
          name: "callOptionAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          name: "callOptionAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          name: "callOptionAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
          name: "callOptionAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
      name: "cancelListing";
      accounts: [
        {
          name: "borrower";
          isMut: false;
          isSigner: true;
        },
        {
          name: "borrowerDepositTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "listingAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowAccount";
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
        }
      ];
      args: [];
    },
    {
      name: "closeListing";
      accounts: [
        {
          name: "borrower";
          isMut: true;
          isSigner: true;
        },
        {
          name: "listingAccount";
          isMut: true;
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
            name: "escrow";
            type: "publicKey";
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
      name: "listing";
      type: {
        kind: "struct";
        fields: [
          {
            name: "state";
            type: "u8";
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
            type: "u64";
          },
          {
            name: "startDate";
            type: "i64";
          },
          {
            name: "escrow";
            type: "publicKey";
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
            type: "u64";
          },
          {
            name: "startDate";
            type: "i64";
          },
          {
            name: "escrow";
            type: "publicKey";
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
    }
  ];
  types: [
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
      name: "ListingState";
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
      name: "InvalidExpiry";
      msg: "Invalid expiry";
    },
    {
      code: 6002;
      name: "InvalidState";
      msg: "Invalid state";
    },
    {
      code: 6003;
      name: "InvalidListingType";
      msg: "Invalid listing type";
    },
    {
      code: 6004;
      name: "OptionExpired";
      msg: "Option expired";
    },
    {
      code: 6005;
      name: "OptionNotExpired";
      msg: "Option not expired";
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
          name: "loanAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          type: "u64",
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
          name: "loanAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          name: "loanAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loanAccount",
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
      name: "repossessCollateral",
      accounts: [
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lenderTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loanAccount",
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
          name: "callOptionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          name: "callOptionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          name: "callOptionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
          name: "callOptionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
      name: "cancelListing",
      accounts: [
        {
          name: "borrower",
          isMut: false,
          isSigner: true,
        },
        {
          name: "borrowerDepositTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "listingAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowAccount",
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
      ],
      args: [],
    },
    {
      name: "closeListing",
      accounts: [
        {
          name: "borrower",
          isMut: true,
          isSigner: true,
        },
        {
          name: "listingAccount",
          isMut: true,
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
            name: "escrow",
            type: "publicKey",
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
      name: "listing",
      type: {
        kind: "struct",
        fields: [
          {
            name: "state",
            type: "u8",
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
            type: "u64",
          },
          {
            name: "startDate",
            type: "i64",
          },
          {
            name: "escrow",
            type: "publicKey",
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
            type: "u64",
          },
          {
            name: "startDate",
            type: "i64",
          },
          {
            name: "escrow",
            type: "publicKey",
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
  ],
  types: [
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
      name: "ListingState",
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
      name: "InvalidExpiry",
      msg: "Invalid expiry",
    },
    {
      code: 6002,
      name: "InvalidState",
      msg: "Invalid state",
    },
    {
      code: 6003,
      name: "InvalidListingType",
      msg: "Invalid listing type",
    },
    {
      code: 6004,
      name: "OptionExpired",
      msg: "Option expired",
    },
    {
      code: 6005,
      name: "OptionNotExpired",
      msg: "Option not expired",
    },
  ],
};
