import { Box } from "@mui/material";
import { calculateBalances } from "../utils";
import BalanceCard from "../BalanceCard/BalanceCard";
import { useEffect, useState } from "react";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";

function GroupBalances({ group }) {
  const { currentCurrency } = useCurrentCurrency();
  const [balances, setBalances] = useState([]);

  const fetchBalances = async () => {
    calculateBalances(group, currentCurrency).then((result) =>
      setBalances(result)
    );
  };

  useEffect(() => {
    fetchBalances();
  }, [group, currentCurrency]);

  return (
    <Box sx={{ height: "51vh", overflow: "auto" }}>
      <BalanceCard balances={balances} groupId={group?.id} />
    </Box>
  );
}

export default GroupBalances;
