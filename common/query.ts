import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

import { ListingState } from "./types";
import { getProgram, getProvider } from "./provider";

export async function fetchListing(
  connection: anchor.web3.Connection,
  listing: anchor.web3.PublicKey
) {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listingAccount = await program.account.listing.fetch(listing);

  const whitelist = (await import("../public/whitelist.json")).default;

  if (!whitelist.includes(listingAccount.mint.toBase58())) {
    throw new Error("Mint not whitelisted");
  }

  const [metadataAddress] = await getMetadataPDA(listingAccount.mint);
  const metadataAccountInfo = await connection.getAccountInfo(metadataAddress);

  if (metadataAccountInfo === null) {
    throw new Error("No metadata");
  }

  const [metadata] = Metadata.fromAccountInfo(metadataAccountInfo);

  return {
    metadata,
    listing: listingAccount,
  };
}

export async function fetchMultipleListings(
  connection: anchor.web3.Connection,
  filter: anchor.web3.GetProgramAccountsFilter[] = []
) {
  const provider = getProvider(connection);
  const program = getProgram(provider);
  const listings = await program.account.listing.all(filter);

  const filteredListings = listings.sort(
    (a, b) => a.account.amount.toNumber() - b.account.amount.toNumber()
  );

  const metadataAddresses = await Promise.all(
    filteredListings.map((listing) =>
      getMetadataPDA(listing.account.mint).then(([address]) => address)
    )
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  const combinedAccounts = listings.map((listing, index) => {
    const metadataAccount = rawMetadataAccounts[index];

    if (metadataAccount) {
      try {
        const [metadata] = Metadata.fromAccountInfo(metadataAccount);

        return {
          metadata,
          listing,
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

function getMetadataPDA(mint: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
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

export async function fetchNFTs(
  connection: anchor.web3.Connection,
  publicKey: anchor.web3.PublicKey
) {
  const whitelist = (await import("../public/whitelist.json")).default;

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
    accounts.filter((account) =>
      whitelist.includes(account.data.mint.toBase58())
    )
  );

  const metadataAddresses = await Promise.all(
    tokenAccounts.map((account) =>
      getMetadataPDA(account.data.mint).then(([address]) => address)
    )
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  const combinedAccounts = rawMetadataAccounts.map((metadataAccount, index) => {
    if (metadataAccount) {
      try {
        const accountInfo = tokenAccounts[index];

        // @ts-ignore
        if (accountInfo.data.amount === 0n) {
          return null;
        }

        const [metadata] = Metadata.fromAccountInfo(metadataAccount);

        return {
          metadata,
          accountInfo,
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
  mint: anchor.web3.PublicKey
) {
  const signatures = await connection.getSignaturesForAddress(mint);
  const parsedTransactions = await connection.getParsedTransactions(
    signatures.map(({ signature }) => signature)
  );
  console.log("parsedTransactions", parsedTransactions);
  return parsedTransactions;
}

export async function fetchMagicEdenCollectionStats(symbol: string) {
  const response = await fetch(
    `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`
  );

  return response.json();
}
