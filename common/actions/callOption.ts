import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

import * as query from "../query";
import { getProgram, getProvider } from "../provider";

export async function initCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey,
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  }
) {
  const amount = new anchor.BN(options.amount);
  const strikePrice = new anchor.BN(options.strikePrice);
  const expiry = new anchor.BN(options.expiry);

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );
  const escrowAccount = await query.findEscrowAddress(mint);

  await program.methods
    .initCallOption(amount, strikePrice, expiry)
    .accounts({
      mint,
      escrowAccount,
      callOptionAccount,
      seller: wallet.publicKey,
      depositTokenAccount,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function buyCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const escrowAccount = await query.findEscrowAddress(mint);
  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );
  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  await program.methods
    .buyCallOption()
    .accounts({
      escrowAccount,
      callOptionAccount,
      depositTokenAccount,
      mint,
      seller,
      buyer: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function exerciseCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  buyerTokenAccount: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );
  const escrowAccount = await query.findEscrowAddress(mint);

  await program.methods
    .exerciseCallOption()
    .accounts({
      buyer: wallet.publicKey,
      buyerTokenAccount,
      callOptionAccount,
      escrowAccount,
      mint,
      seller,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
}

export async function closeCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionAccount = await query.findCallOptionAddress(
    mint,
    wallet.publicKey
  );
  const escrowAccount = await query.findEscrowAddress(mint);

  await program.methods
    .closeCallOption()
    .accounts({
      depositTokenAccount,
      mint,
      callOptionAccount,
      escrowAccount,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}
