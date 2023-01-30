import { web3 } from "@project-serum/anchor";
import { Key, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import type { CollectionData, CollectionConfig } from "../types";

export type CollectionArgs = {
  data: CollectionData;
  metadata: Metadata;
  publicKey: web3.PublicKey;
};

export type CollectionPretty = ReturnType<Collection["pretty"]>;

export class Collection implements CollectionArgs {
  constructor(
    public readonly data: CollectionData,
    public readonly metadata: Metadata,
    public readonly publicKey: web3.PublicKey
  ) {}

  get config() {
    return this.data.config as CollectionConfig;
  }

  pretty() {
    return {
      data: {
        authority: this.data.authority.toBase58(),
        config: this.data.config,
        reserved: this.data.reserved,
        mint: this.data.mint.toBase58(),
        bump: this.data.bump,
      },
      metadata: this.metadata.pretty(),
      publicKey: this.publicKey.toBase58(),
    };
  }

  static fromJSON(args: CollectionPretty) {
    return new Collection(
      {
        authority: new web3.PublicKey(args.data.authority),
        mint: new web3.PublicKey(args.data.mint),
        config: args.data.config,
        reserved: args.data.reserved,
        bump: args.data.bump,
      },
      Metadata.fromArgs({
        key: 0 as Key, // TODO
        updateAuthority: new web3.PublicKey(args.metadata.updateAuthority),
        mint: new web3.PublicKey(args.metadata.mint),
        data: args.metadata.data,
        primarySaleHappened: args.metadata.primarySaleHappened,
        isMutable: args.metadata.isMutable,
        editionNonce: args.metadata.editionNonce,
        tokenStandard: args.metadata.tokenStandard,
        collection: args.metadata.collection,
        collectionDetails: args.metadata.collectionDetails,
        uses: args.metadata.uses,
      }),
      new web3.PublicKey(args.publicKey)
    );
  }
}
