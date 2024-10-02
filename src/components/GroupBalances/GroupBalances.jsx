import { Box } from "@mui/material";
import { calculateBalances } from "../utils";
import BalanceCard from "../BalanceCard/BalanceCard";

function GroupBalances({ group }) {
  console.log(calculateBalances(group));
  return (
    <Box sx={{ height: "53vh", overflow: "auto" }}>
      <BalanceCard balances={calculateBalances(group)} />
    </Box>
  );
}

export default GroupBalances;
