import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

import { LISTINGS_PROGRAM_ID } from "./constants";
import {
  ListingResult,
  ListingState,
  LoanResult,
  Loan,
  CallOptionResult,
} from "./types";
import { getProgram, getProvider } from "./provider";

export async function findListingAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [listingAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("listing"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return listingAccount;
}

export async function findLoanAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [loanAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("loan"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return loanAddress;
}

export async function findCallOptionAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [callOptionAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("call_option"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return callOptionAddress;
}

export async function findEscrowAddress(
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [escrowAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("escrow"), mint.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return escrowAccount;
}

export async function findMetadataAddress(mint: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
}

export async function assertMintIsWhitelisted(mint: anchor.web3.PublicKey) {
  const origin =
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_HOST : "";

  const response = await fetch(`${origin}/api/whitelist/${mint.toBase58()}`);

  if (response.ok === false) {
    const message = await response.json();
    // throw new Error(message);
  }
}

export async function fetchMetadata(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey
): Promise<Metadata> {
  const [metadataAddress] = await findMetadataAddress(mint);
  const metadataAccountInfo = await connection.getAccountInfo(metadataAddress);

  if (metadataAccountInfo === null) {
    throw new Error("No metadata");
  }

  return Metadata.fromAccountInfo(metadataAccountInfo)[0];
}

export async function fetchListing(
  connection: anchor.web3.Connection,
  listing: anchor.web3.PublicKey
): Promise<ListingResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const listingAccount = await program.account.listing.fetch(listing);

  assertMintIsWhitelisted(listingAccount.mint);

  const metadata = await fetchMetadata(connection, listingAccount.mint);

  return {
    metadata,
    publicKey: listing,
    data: listingAccount,
  };
}

export async function fetchLoan(
  connection: anchor.web3.Connection,
  loan: anchor.web3.PublicKey
): Promise<LoanResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const loanAccount = await program.account.loan.fetch(loan);

  assertMintIsWhitelisted(loanAccount.mint);

  const metadata = await fetchMetadata(connection, loanAccount.mint);

  return {
    metadata,
    publicKey: loan,
    data: loanAccount as Loan,
  };
}

export async function fetchCallOption(
  connection: anchor.web3.Connection,
  callOption: anchor.web3.PublicKey
): Promise<CallOptionResult> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const callOptionAccount = await program.account.callOption.fetch(callOption);

  assertMintIsWhitelisted(callOptionAccount.mint);

  const metadata = await fetchMetadata(connection, callOptionAccount.mint);

  return {
    metadata,
    publicKey: callOption,
    data: callOptionAccount,
  };
}

export async function fetchMetadataAccounts(
  connection: anchor.web3.Connection,
  items: {
    account: { mint: anchor.web3.PublicKey };
  }[]
) {
  const metadataAddresses = await Promise.all(
    items.map((listing) =>
      findMetadataAddress(listing.account.mint).then(([address]) => address)
    )
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  return rawMetadataAccounts.map((account) =>
    account ? Metadata.fromAccountInfo(account)[0] : null
  );
}

export async function fetchMultipleListings(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<ListingResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.listing
    .all(filter)
    .then((result) =>
      result.sort(
        (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
      )
    );

  const metadataAccounts = await fetchMetadataAccounts(connection, listings);

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return {
        metadata: metadataAccount,
        publicKey: listing.publicKey,
        data: listing.account,
      };
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as ListingResult[];
}

export const fetchActiveListings = (connection: anchor.web3.Connection) => {
  return fetchMultipleListings(connection, [
    {
      memcmp: {
        // filter active
        offset: 7 + 1,
        bytes: bs58.encode(
          new anchor.BN(ListingState.Active).toArrayLike(Buffer)
        ),
      },
    },
  ]);
};

export async function fetchMultipleLoans(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<LoanResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.loan
    .all(filter)
    .then((result) =>
      result.sort(
        (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
      )
    );

  const metadataAccounts = await fetchMetadataAccounts(connection, listings);

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return {
        metadata: metadataAccount,
        publicKey: listing.publicKey,
        data: listing.account,
      };
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as LoanResult[];
}

export async function fetchMultipleCallOptions(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
): Promise<CallOptionResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.loan
    .all(filter)
    .then((result) =>
      result.sort(
        (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
      )
    );

  const metadataAccounts = await fetchMetadataAccounts(connection, listings);

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = metadataAccounts[index];

    if (metadataAccount) {
      return {
        metadata: metadataAccount,
        publicKey: listing.publicKey,
        data: listing.account,
      };
    }
    return null;
  });

  return combinedAccounts.filter(Boolean) as CallOptionResult[];
}

export async function fetchNFTs(
  connection: anchor.web3.Connection,
  publicKey: anchor.web3.PublicKey
) {
  const rawTokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
    programId: splToken.TOKEN_PROGRAM_ID,
  });

  const tokenAccounts = await Promise.all(
    rawTokenAccounts.value.map(({ pubkey, account }) => {
      const decodedInfo = splToken.AccountLayout.decode(
        account.data.slice(0, splToken.ACCOUNT_SIZE)
      );

      return {
        pubkey,
        data: decodedInfo,
      };
    })
  ).then((accounts) =>
    accounts.filter((account) => account.data.amount === BigInt("1"))
  );

  const whitelist: { mints: string[] } = await fetch("/api/whitelist/filter", {
    method: "POST",
    body: JSON.stringify({
      mints: tokenAccounts.map((account) => account.data.mint.toBase58()),
    }),
  }).then((response) => response.json());

  const filteredTokenAccounts = tokenAccounts.filter(
    (account) => true // whitelist.mints.includes(account.data.mint.toBase58())
  );

  const metadataAddresses = await Promise.all(
    filteredTokenAccounts.map((account) =>
      findMetadataAddress(account.data.mint).then(([address]) => address)
    )
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  const combinedAccounts = rawMetadataAccounts.map((metadataAccount, index) => {
    if (metadataAccount) {
      try {
        const tokenAccount = filteredTokenAccounts[index];

        if (tokenAccount.data.amount === BigInt("0")) {
          return null;
        }

        const [metadata] = Metadata.fromAccountInfo(metadataAccount);

        return {
          metadata,
          tokenAccount,
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    }
    return null;
  });

  return combinedAccounts.filter(Boolean);
}

export async function fetchParsedTransactions(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey,
  limit: number
) {
  const signatures = await connection.getSignaturesForAddress(mint, { limit });
  const parsedTransactions = await connection.getParsedTransactions(
    signatures.map(({ signature }) => signature)
  );
  return parsedTransactions;
}
