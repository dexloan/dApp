import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as utils from "../utils";
import { getProgram, getProvider } from "../provider";
import { NftResult } from "../types";
import { fetchTokenManager } from "./tokenManager";

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
) {
  const [metadataPda] = await findMetadataAddress(mint);

  // Sometimes collection mints don't have metadata
  let metadata = null;

  try {
    metadata = await Metadata.fromAccountAddress(connection, metadataPda);
  } catch {}

  return metadata;
}

export async function fetchMetadataAccounts(
  connection: anchor.web3.Connection,
  mints: anchor.web3.PublicKey[]
) {
  const metadataAddresses = await Promise.all(
    mints.map((mint) => findMetadataAddress(mint).then(([address]) => address))
  );

  const rawMetadataAccounts = await connection.getMultipleAccountsInfo(
    metadataAddresses
  );

  return rawMetadataAccounts
    .map((account) => (account ? Metadata.fromAccountInfo(account)[0] : null))
    .filter(utils.notNull);
}

// Can remove this when we update spl-token lib
function unpackToken(
  address: anchor.web3.PublicKey,
  info: anchor.web3.AccountInfo<Buffer> | null,
  programId = splToken.TOKEN_PROGRAM_ID
) {
  if (!info) throw new splToken.TokenAccountNotFoundError();

  const rawAccount = splToken.AccountLayout.decode(info.data);
  if (!info.owner.equals(programId))
    throw new splToken.TokenInvalidAccountOwnerError();
  if (info.data.length < splToken.ACCOUNT_SIZE)
    throw new splToken.TokenInvalidAccountSizeError();

  return {
    address,
    mint: rawAccount.mint,
    owner: rawAccount.owner,
    amount: rawAccount.amount,
    delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
    delegatedAmount: rawAccount.delegatedAmount,
    isInitialized: rawAccount.state !== splToken.AccountState.Uninitialized,
    isFrozen: rawAccount.state === splToken.AccountState.Frozen,
    isNative: !!rawAccount.isNativeOption,
    rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
    closeAuthority: rawAccount.closeAuthorityOption
      ? rawAccount.closeAuthority
      : null,
  };
}

export async function fetchNft(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey
): Promise<NftResult> {
  const largestTokenAccounts = await connection.getTokenLargestAccounts(mint);

  const [tokenAccount, metadata] = await Promise.all([
    splToken.getAccount(connection, largestTokenAccounts.value[0].address),
    fetchMetadata(connection, mint),
  ]);

  if (metadata === null) {
    throw new Error("No metadata found for mint");
  }

  let tokenManager = null;

  try {
    tokenManager = await fetchTokenManager(
      connection,
      mint,
      tokenAccount.owner
    );
  } catch (err) {
    console.log(err);
  }

  return {
    metadata,
    tokenAccount,
    tokenManager,
  };
}

export async function fetchNfts(
  connection: anchor.web3.Connection,
  owner: anchor.web3.PublicKey
): Promise<NftResult[]> {
  const provider = getProvider(connection);
  const program = getProgram(provider);

  const [collectionMints, tokenAccounts] = await Promise.all([
    program.account.collection
      .all()
      .then((collections) =>
        collections.map((collection) => collection.account.mint)
      ),
    connection
      .getTokenAccountsByOwner(owner, {
        programId: splToken.TOKEN_PROGRAM_ID,
      })
      .then((rawTokenAccounts) => {
        return rawTokenAccounts.value.map(({ pubkey, account }) =>
          unpackToken(pubkey, account)
        );
      }),
  ]);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    tokenAccounts.map((a) => a.mint)
  );

  const combinedAccounts = await Promise.all(
    metadataAccounts.map(async (metadata) => {
      const collectionMint = metadata?.collection?.key;
      const tokenAccount = tokenAccounts.find((account) =>
        account.mint.equals(metadata.mint)
      );

      let tokenManager = null;

      if (
        metadata &&
        tokenAccount &&
        collectionMint !== undefined &&
        collectionMints.some((mint) => mint.equals(collectionMint))
      ) {
        if (tokenAccount.amount === BigInt("0") || tokenAccount.isFrozen) {
          // Check if token manager exists
          try {
            tokenManager = await fetchTokenManager(
              connection,
              tokenAccount.mint,
              owner
            );
            console.log("tokenManager: ", tokenManager);
          } catch (err) {
            console.log(err);
            return null;
          }
        }

        return {
          metadata,
          tokenAccount,
          tokenManager,
        };
      }
      return null;
    })
  ).then((accounts) => accounts.filter(utils.notNull));

  return combinedAccounts;
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
