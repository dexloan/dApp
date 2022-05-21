import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";

import { getProgram, getProvider } from "./provider";

class ListingOptions {
  public amount: anchor.BN;
  public duration: anchor.BN;
  public basisPoints: number;
  public discriminator: number;

  constructor(options: {
    amount: number;
    duration: number;
    basisPoints: number;
    discriminator: number;
  }) {
    this.amount = new anchor.BN(options.amount);
    this.duration = new anchor.BN(options.duration);
    this.basisPoints = options.basisPoints;
    this.discriminator = options.discriminator;
  }
}

export async function createListing(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrowerDepositTokenAccount: anchor.web3.PublicKey,
  options: {
    amount: number;
    duration: number;
    basisPoints: number;
  }
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [listingAccount, discriminator] = await findListingAddress(
    connection,
    mint,
    wallet.publicKey,
    program.programId
  );

  const [escrowAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("escrow"), mint.toBuffer()],
    program.programId
  );

  const listingOptions = new ListingOptions({
    ...options,
    discriminator,
  });

  await program.methods
    .initListing(listingOptions)
    .accounts({
      escrowAccount,
      listingAccount,
      mint,
      borrowerDepositTokenAccount,
      borrower: wallet.publicKey,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
}

function getDiscriminator(excluded: number) {
  let n = Math.floor(Math.random() * 255);
  if (n >= excluded) n++;
  return n;
}

export async function findListingAddress(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey,
  programId: anchor.web3.PublicKey,
  excluded: number = 256
): Promise<[anchor.web3.PublicKey, number]> {
  const discriminator = getDiscriminator(excluded);

  const [listingAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("listing"),
      mint.toBuffer(),
      borrower.toBuffer(),
      new anchor.BN(discriminator).toArrayLike(Buffer),
    ],
    programId
  );

  const account = await connection.getAccountInfo(listingAccount);

  if (account === null) {
    return [listingAccount, discriminator];
  }

  return findListingAddress(
    connection,
    mint,
    borrower,
    programId,
    discriminator
  );
}

export async function createLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey,
  listing: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .makeLoan()
    .accounts({
      borrower,
      mint,
      listingAccount: listing,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function cancelListing(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  listingAccount: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey,
  escrowAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .cancelListing()
    .accounts({
      escrowAccount,
      listingAccount,
      mint,
      borrowerDepositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function repayLoan(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  listingAccount: anchor.web3.PublicKey,
  borrowerTokenAccount: anchor.web3.PublicKey,
  escrowAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .repayLoan()
    .accounts({
      lender,
      listingAccount,
      escrowAccount,
      mint,
      borrowerDepositTokenAccount: borrowerTokenAccount,
      borrower: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function closeAccount(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  listingAccount: anchor.web3.PublicKey
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .closeAccount()
    .accounts({
      listingAccount,
      borrower: wallet.publicKey,
    })
    .rpc();
}

export async function getOrCreateTokenAccount(
  connection: anchor.web3.Connection,
  wallet: WalletContextState,
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  if (!wallet.publicKey) {
    throw new Error("No wallet");
  }

  const response = await connection.getTokenAccountsByOwner(wallet.publicKey, {
    mint,
  });

  let tokenAccount: anchor.web3.PublicKey | undefined;

  // Ensure existing token account is rent exempt
  if (response.value[0]) {
    const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(
      response.value[0].account.data.length
    );

    if (response.value[0].account.lamports >= rentExemptAmount) {
      tokenAccount = response.value[0].pubkey;
    }
  }

  if (tokenAccount === undefined) {
    [tokenAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        splToken.TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const receiverAccount = await connection.getAccountInfo(tokenAccount);

    if (!receiverAccount) {
      const transaction = new anchor.web3.Transaction({
        feePayer: wallet.publicKey,
      });

      transaction.add(
        splToken.createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          tokenAccount,
          wallet.publicKey,
          mint,
          splToken.TOKEN_PROGRAM_ID,
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      const txId = await wallet.sendTransaction(transaction, connection);

      await connection.confirmTransaction(txId);
    }
  }

  if (tokenAccount === undefined) {
    throw new Error("Could not create token account");
  }

  return tokenAccount;
}

export async function repossessCollateral(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  escrowAccount: anchor.web3.PublicKey,
  lenderTokenAccount: anchor.web3.PublicKey,
  listingAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  await program.methods
    .repossessCollateral()
    .accounts({
      escrowAccount,
      mint,
      lenderTokenAccount,
      listingAccount,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}
