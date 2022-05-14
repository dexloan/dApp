import * as anchor from "@project-serum/anchor";
import { Link } from "@chakra-ui/react";

interface ExplorerLinkProps {
  children: React.ReactNode;
  address: anchor.web3.PublicKey;
}

export function ExplorerLink({ children, address }: ExplorerLinkProps) {
  return (
    <Link
      href={`https://explorer.solana.com/address/${address.toBase58()}`}
      isExternal
    >
      {children}
    </Link>
  );
}
