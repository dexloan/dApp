import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import { LISTINGS_PROGRAM_ID } from "../constants";

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

function hasDelegate(data: splToken.RawAccount) {
  return data.delegate.toBase58() !== "11111111111111111111111111111111";
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
    accounts.filter(
      (account) =>
        account.data.amount === BigInt("1") && !hasDelegate(account.data)
    )
  );

  console.log(
    "tokenAccounts: ",
    tokenAccounts.map((acc) => acc.data.delegate.toBase58())
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

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    filteredTokenAccounts.map((a) => ({ account: { mint: a.data.mint } }))
  );

  const combinedAccounts = metadataAccounts.map((metadata, index) => {
    if (metadata) {
      try {
        const tokenAccount = filteredTokenAccounts[index];

        if (tokenAccount.data.amount === BigInt("0")) {
          return null;
        }

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
