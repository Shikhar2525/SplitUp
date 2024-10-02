import { v4 as uuidv4 } from "uuid";

export const formatDate = (timestamp) => {
  if (timestamp?.seconds) {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to JS Date
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }); // Format it to '28 September 2024'
  }
  return "N/A";
};

export const sortByDate = (arr) => {
  return arr.sort((a, b) => {
    // Convert 'createdDate.seconds' and 'createdDate.nanoseconds' to Date objects
    const dateA = new Date(
      Number(a.createdDate.seconds) * 1000 +
        Number(a.createdDate.nanoseconds) / 1000000
    );
    const dateB = new Date(
      Number(b.createdDate.seconds) * 1000 +
        Number(b.createdDate.nanoseconds) / 1000000
    );

    // Compare the two dates (latest first)
    return dateB.getTime() - dateA.getTime(); // Use getTime() for comparison
  });
};

export function formatTransactionDate(dateString) {
  const date = new Date(dateString);
  console.log(date);
  // Array of month abbreviations
  const monthAbbreviations = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthAbbreviations[date.getMonth()]; // Get the month abbreviation
  const day = date.getDate(); // Get the day of the month

  // Add leading zero to single-digit days
  const formattedDay = day < 10 ? `0${day}` : day;

  return {
    month,
    day: formattedDay, // Use the formatted day with leading zero
  };
}

export function sortByISODate(arr) {
  return arr.sort((a, b) => {
    const dateA = new Date(a.createdDate);
    const dateB = new Date(b.createdDate);
    return dateB - dateA; // Sorts in descending order (latest first)
  });
}

export function calculateBalances(group) {
  const balances = {};
  const transactions = {}; // To track the transactions between members

  // Initialize balances for each member
  group.members.forEach((member) => {
    balances[member.email] = 0;
  });

  // Process each expense
  group.expenses.forEach((expense) => {
    const amount = expense.amount;
    const paidBy = expense.paidBy;
    const splitBetween = expense.splitBetween;

    // Calculate the share for each member involved in the expense
    const share = amount / (splitBetween.length + 1); // +1 to include the payer

    // Update balances and add records of each individual transaction
    splitBetween.forEach((email) => {
      balances[email] -= share; // Each member owes their share
      balances[paidBy] += share; // The payer is owed that amount

      // Record the transaction for breakdown purposes
      if (!transactions[email]) {
        transactions[email] = {};
      }
      if (!transactions[email][paidBy]) {
        transactions[email][paidBy] = {
          amount: 0,
          breakdown: [], // Track who owed what in each transaction
        };
      }

      // Add the breakdown details of each expense
      transactions[email][paidBy].amount += share;
      transactions[email][paidBy].breakdown.push({
        description: expense.description,
        amount: parseFloat(share.toFixed(2)), // Round to 2 decimals
        paidBy: paidBy,
        owedBy: email,
        createdDate: expense.createdDate,
      });
    });
  });

  // Create a result array showing only the final settlements
  const result = [];
  const processedPairs = new Set(); // Track processed pairs to avoid duplication

  // Loop through the transactions and calculate net settlements
  Object.keys(transactions).forEach((debtor) => {
    Object.keys(transactions[debtor]).forEach((creditor) => {
      const pairKey = [debtor, creditor].sort().join("-"); // Unique pair key

      if (!processedPairs.has(pairKey)) {
        const debtorAmount = transactions[debtor][creditor].amount;
        const creditorAmount = transactions[creditor]?.[debtor]?.amount || 0;

        // Calculate the net amount to be settled
        const netAmount = debtorAmount - creditorAmount;

        let finalDebtor = debtor;
        let finalCreditor = creditor;

        // Adjust the settlement direction if the net amount is negative
        if (netAmount < 0) {
          finalDebtor = creditor;
          finalCreditor = debtor;
        }

        // Only include the transaction if there is an outstanding amount
        if (netAmount !== 0) {
          result.push({
            id: uuidv4(), // Add a unique ID for each settlement entry
            debtor: finalDebtor,
            creditor: finalCreditor,
            amount: parseFloat(Math.abs(netAmount).toFixed(2)), // Round to 2 decimals
            breakdown: [
              ...transactions[debtor][creditor].breakdown,
              ...(transactions[creditor]?.[debtor]?.breakdown || []),
            ], // Combine breakdowns from both sides for clarity
          });
        }

        // Mark this pair as processed
        processedPairs.add(pairKey);
      }
    });
  });

  return result;
}
