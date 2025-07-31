  import { Box, Alert } from "@mui/material";
  import { calculateBalances, calculateSimplifiedBalances } from "../utils";
  import BalanceCard from "../BalanceCard/BalanceCard";
  import { useEffect, useState } from "react";
  import { useCurrentCurrency } from "../contexts/CurrentCurrency";

  function GroupBalances({ group }) {
    const { currentCurrency } = useCurrentCurrency();
    const [balances, setBalances] = useState([]);
    const [isSimplified, setIsSimplified] = useState(true); // Default to simplified mode

    const fetchBalances = async () => {
      const rawBalances = isSimplified
        ? await calculateSimplifiedBalances(group, currentCurrency)
        : await calculateBalances(group, currentCurrency);

      const filteredBalances = rawBalances.filter((balance) => {
        const debtorEmail = balance.debtor?.email;
        const debtor = group.members.find((m) => m.email === debtorEmail);

        return !(debtor?.userSettled === true);
      });

      setBalances(filteredBalances);
    };

    useEffect(() => {
      fetchBalances();
    }, [group, currentCurrency, isSimplified]);

    return (
      <Box
        sx={{
          height: "100%",
          overflow: "auto",
          px: 2,
          pt: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(94, 114, 228, 0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {!isSimplified && (
          <Alert
            severity="info"
            variant="filled"
            sx={{
              mb: 2,
              borderRadius: "8px",
              backgroundColor: "#FD7289",
              color: "#fff",
            }}
          >
            Always settle your final payments considering <strong>Advance Split Mode</strong>. 
            Normal Split Mode is only for better understanding.
          </Alert>
        )}

        <BalanceCard
          balances={balances}
          isSimplified={isSimplified}
          onSimplifiedChange={(value) => setIsSimplified(value)}
          groupName={group.title}
          groupCreatedDate={group.createdDate}
        />
      </Box>
    );
  }

  export default GroupBalances;
