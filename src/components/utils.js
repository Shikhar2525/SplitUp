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
  group?.members?.forEach((member) => {
    balances[member?.email] = 0;
  });

  // Process each expense
  group?.expenses?.forEach((expense) => {
    const amount = expense.amount;
    const paidBy = expense.paidBy; // Object with email and name
    const splitBetween = expense.splitBetween; // Array of objects with email and name

    // Calculate the share for each member involved in the expense
    const share = amount / (splitBetween.length + 1); // +1 to include the payer

    // Update balances and add records of each individual transaction
    splitBetween.forEach(({ email, name }) => {
      balances[email] -= share; // Each member owes their share
      balances[paidBy.email] += share; // The payer is owed that amount

      // Record the transaction for breakdown purposes
      if (!transactions[email]) {
        transactions[email] = {};
      }
      if (!transactions[email][paidBy.email]) {
        transactions[email][paidBy.email] = {
          amount: 0,
          breakdown: [], // Track who owed what in each transaction
        };
      }

      // Add the breakdown details of each expense
      transactions[email][paidBy.email].amount += share;
      transactions[email][paidBy.email].breakdown.push({
        description: expense.description,
        amount: parseFloat(share.toFixed(2)), // Round to 2 decimals
        paidBy: { email: paidBy.email, name: paidBy.name }, // Include name and email
        owedBy: { email: email, name: name }, // Include name and email
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
          // Check if the debtor's userSettled is true or not present
          const debtorMember = group.members.find(
            (m) => m.email === finalDebtor
          );
          if (
            !debtorMember ||
            debtorMember.userSettled === false ||
            debtorMember.userSettled === undefined
          ) {
            result.push({
              id: uuidv4(), // Add a unique ID for each settlement entry
              debtor: {
                email: finalDebtor,
                name:
                  group.members.find((m) => m.email === finalDebtor)?.name ||
                  debtor + " (left)",
              }, // Include name and email
              creditor: {
                email: finalCreditor,
                name:
                  group.members.find((m) => m.email === finalCreditor)?.name ||
                  creditor + " (left)",
              }, // Include name and email
              amount: parseFloat(Math.abs(netAmount).toFixed(2)), // Round to 2 decimals
              breakdown: [
                ...transactions[debtor][creditor].breakdown,
                ...(transactions[creditor]?.[debtor]?.breakdown || []),
              ], // Combine breakdowns from both sides for clarity
            });
          }
        }

        // Mark this pair as processed
        processedPairs.add(pairKey);
      }
    });
  });

  return result;
}

export function isEmail(input) {
  // Basic pattern to check if string is in email format
  const emailRegex = /\S+@\S+\.\S+/;

  // Return true if the input matches the pattern, otherwise false
  return emailRegex.test(input);
}

export function calculateTotalsAcrossGroups(groups, yourEmail) {
  let totalYouGet = 0;
  let totalYouGive = 0;

  groups.forEach((group) => {
    // Assuming calculateBalances(group) returns balances for each group
    const balances = calculateBalances(group);

    balances.forEach((balance) => {
      // If you are the creditor, add the amount to totalYouGet
      if (balance.creditor.email === yourEmail) {
        totalYouGet += balance.amount;
      }
      // If you are the debtor, add the amount to totalYouGive
      if (balance.debtor.email === yourEmail) {
        totalYouGive += balance.amount;
      }
    });
  });

  // Calculate the total balance
  const totalBalance = totalYouGet - totalYouGive;

  // Add "+" sign for positive balances, "-" will be added automatically for negative
  const formattedBalance =
    totalBalance > 0 ? `+${totalBalance}` : `${totalBalance}`;

  return {
    youGet: totalYouGet,
    youGive: totalYouGive,
    balance: formattedBalance,
  };
}

export function sortLogsByDate(logs) {
  return logs.sort((a, b) => {
    const dateA = a.details.date.seconds + a.details.date.nanoseconds / 1e9; // Convert to a timestamp
    const dateB = b.details.date.seconds + b.details.date.nanoseconds / 1e9; // Convert to a timestamp
    return dateB - dateA; // Sort in descending order
  });
}

export function capitalizeFirstLetter(sentence) {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function formatFirestoreTimestamp(timestamp) {
  // Extract seconds and nanoseconds from the Firestore timestamp
  const seconds = timestamp.seconds;
  const nanoseconds = timestamp.nanoseconds;

  // Convert the Firestore timestamp to a JavaScript Date object
  const date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));

  // Format the date to the desired string format
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true, // To get AM/PM format
  });

  return formattedDate;
}

export async function convertCurrency(amount, toCurrency, fromCurrency) {
  // Create the API URL dynamically based on the currency pair
  const apiUrl = `https://raw.githubusercontent.com/WoXy-Sensei/currency-api/main/api/${fromCurrency}_${toCurrency}.json`;

  try {
    // Fetch the currency conversion data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const currencyData = await response.json();

    // Extract the necessary data
    const { rate } = currencyData;

    // Convert the amount
    if (fromCurrency === toCurrency) {
      return amount; // No conversion needed
    }

    const convertedAmount = amount * rate;
    return {
      amount: convertedAmount.toFixed(2), // Format to 2 decimal places
      toCurrency: fromCurrency,
    };
  } catch (error) {
    console.error("Error fetching currency data:", error);
  }
}
