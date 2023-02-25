import type { NextPage } from "next";
import { CallOptionState } from "@prisma/client";
import { Button, Icon } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { IoAdd } from "react-icons/io5";

import { useCallOptionsQuery } from "../../hooks/query";
import { CallOptionListings } from "../../components/tables/callOptions";
import { useCallOptionSortState } from "../../components/tables";
import { AskCallOptionModal } from "../../components/form";
import { CallOptionLayout } from "../../components/layout";

const CallOptions: NextPage = () => {
  const wallet = useWallet();
  const [callOptionModal, setCallOptionModal] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [sortState, sortBy] = useCallOptionSortState();
  const callOptionsQuery = useCallOptionsQuery({
    collections,
    state: CallOptionState.Listed,
    orderBy: sortState[0],
    sortOrder: sortState[1],
  });

  console.log(callOptionsQuery);

  return (
    <>
      <CallOptionLayout setCollections={setCollections}>
        <CallOptionListings
          action={
            <Button
              size="sm"
              leftIcon={<Icon as={IoAdd} />}
              isDisabled={!wallet.publicKey}
              onClick={() => setCallOptionModal(true)}
            >
              Create Ask
            </Button>
          }
          heading="Asks"
          placeholderMessage="No asks currently"
          callOptions={callOptionsQuery.data}
          isLoading={callOptionsQuery.isLoading}
        />
      </CallOptionLayout>
      <AskCallOptionModal
        open={callOptionModal}
        onRequestClose={() => setCallOptionModal(false)}
      />
    </>
  );
};

export default CallOptions;
