import { Box } from "@mui/material";
import { calculateBalances } from "../utils";
import BalanceCard from "../BalanceCard/BalanceCard";

function GroupBalances({ group }) {
  return (
    <Box sx={{ height: "53vh", overflow: "auto" }}>
      <BalanceCard balances={calculateBalances(group)} groupId={group?.id} />
    </Box>
  );
}

export default GroupBalances;
