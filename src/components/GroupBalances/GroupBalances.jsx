import { Box } from "@mui/material";
import { calculateBalances, calculateSimplifiedBalances } from "../utils";
import BalanceCard from "../BalanceCard/BalanceCard";
import { useEffect, useState } from "react";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";

function GroupBalances({ group }) {
  const { currentCurrency } = useCurrentCurrency();
  const [balances, setBalances] = useState([]);
  const [isSimplified, setIsSimplified] = useState(false);

  const fetchBalances = async () => {
    const result = isSimplified
      ? await calculateSimplifiedBalances(group, currentCurrency)
      : await calculateBalances(group, currentCurrency);
    setBalances(result);
  };

  useEffect(() => {
    fetchBalances();
  }, [group, currentCurrency, isSimplified]);

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
      <BalanceCard 
        balances={balances} 
        isSimplified={isSimplified}
        onSimplifiedChange={(value) => setIsSimplified(value)}
        groupName={group.title}
        groupCreatedDate={group.createdDate} // Add creation date
      />
    </Box>
  );
}

export default GroupBalances;
