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
    <Box sx={{ 
      height: "100%",
      overflow: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(94, 114, 228, 0.2)",
        borderRadius: "4px",
      }
    }}>
      <BalanceCard balances={balances} groupId={group?.id} />
    </Box>
  );
}

export default GroupBalances;
