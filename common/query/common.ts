import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { getProgram, getProvider } from "../provider";

export async function findEditionAddress(mint: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );
}

export async function findMetadataAddress(mint: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
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

export async function fetchNFTs(
  connection: anchor.web3.Connection,
  publicKey: anchor.web3.PublicKey
) {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const collectionMints = await program.account.collection
    .all()
    .then((collections) =>
      collections.map((collection) => collection.account.mint)
    );

  const tokenAccounts = await connection
    .getTokenAccountsByOwner(publicKey, {
      programId: splToken.TOKEN_PROGRAM_ID,
    })
    .then((rawTokenAccounts) => {
      return rawTokenAccounts.value
        .map(({ pubkey, account }) => {
          const decodedInfo = splToken.AccountLayout.decode(
            account.data.slice(0, splToken.ACCOUNT_SIZE)
          );

          return {
            pubkey,
            data: decodedInfo,
          };
        })
        .filter(
          (account) =>
            account.data.amount === BigInt("1") && account.data.state !== 2
        );
    });

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    tokenAccounts.map((a) => ({ account: { mint: a.data.mint } }))
  );

  const combinedAccounts = metadataAccounts.map((metadata, index) => {
    const collectionMint = metadata?.collection?.key;

    if (
      metadata &&
      collectionMint !== undefined &&
      collectionMints.some((mint) => mint.equals(collectionMint))
    ) {
      try {
        const tokenAccount = tokenAccounts[index];

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

export async function fetchTokenAccountAddress(
  connection: anchor.web3.Connection,
  wallet: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey
) {
  return (
    await connection.getTokenAccountsByOwner(wallet, {
      mint,
    })
  ).value?.[0].pubkey;
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
