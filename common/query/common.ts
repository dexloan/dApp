import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as utils from "../utils";
import { getProgram, getProvider } from "../provider";
import { NftResult } from "../types";
import { findTokenManagerAddress } from "./tokenManager";

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
  return Metadata.fromAccountAddress(connection, metadataAddress);
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

  return {
    metadata,
    tokenAccount,
  };
}

export async function fetchNfts(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
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
      .getTokenAccountsByOwner(address, {
        programId: splToken.TOKEN_PROGRAM_ID,
      })
      .then((rawTokenAccounts) => {
        return rawTokenAccounts.value.map(({ pubkey, account }) =>
          unpackToken(pubkey, account)
        );
        // .filter(
        //   (account) => account.amount === BigInt("1") && !account.isFrozen
        // );
      }),
  ]);

  const metadataAccounts = await fetchMetadataAccounts(
    connection,
    tokenAccounts.map((a) => a.mint)
  );

  const combinedAccounts = await Promise.all(
    metadataAccounts.map(async (metadata, index) => {
      const collectionMint = metadata?.collection?.key;

      if (
        metadata &&
        collectionMint !== undefined &&
        collectionMints.some((mint) => mint.equals(collectionMint))
      ) {
        try {
          const tokenAccount = tokenAccounts[index];

          if (tokenAccount.amount === BigInt("0") || tokenAccount.isFrozen) {
            // Check if token manager exists
            const tokenManager = await findTokenManagerAddress(
              tokenAccount.mint,
              address
            );
            try {
              await program.account.tokenManager.fetch(tokenManager);
            } catch (err) {
              return null;
            }
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
    })
  );

  return combinedAccounts.filter(Boolean) as NftResult[];
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
