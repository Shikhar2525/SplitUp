import { v4 as uuidv4 } from "uuid";
import { currencies } from "../constants";

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

export async function calculateBalances(group, finalCurrency) {
  const balances = {};
  const transactions = {};

  // Initialize balances
  group?.members?.forEach((member) => {
    balances[member?.email] = 0;
  });

  // Loop through expenses
  for (const expense of group?.expenses || []) {
    const amount = expense.amount || 0;
    const paidBy = expense.paidBy;
    const splitBetween = expense.splitBetween || [];
    const currency = expense.currency || finalCurrency;

    const convertedAmount =
      currency !== finalCurrency
        ? (await convertCurrency(amount, currency, finalCurrency))?.amount || 0
        : amount;

    const splitCount = expense.excludePayer
      ? splitBetween.length
      : splitBetween.length + 1;

    const share = convertedAmount / splitCount;

    // Update balances and transactions
    for (const { email, name } of splitBetween) {
      balances[email] -= share;
      balances[paidBy.email] += share;

      if (!transactions[email]) transactions[email] = {};
      if (!transactions[email][paidBy.email]) {
        transactions[email][paidBy.email] = {
          amount: 0,
          breakdown: [],
        };
      }

      transactions[email][paidBy.email].amount += share;
      transactions[email][paidBy.email].breakdown.push({
        description: expense.description,
        amount: parseFloat(share.toFixed(2)),
        paidBy: { email: paidBy.email, name: paidBy.name },
        owedBy: { email, name },
        createdDate: expense.createdDate,
        currency: finalCurrency,
        excludePayer: expense.excludePayer,
      });
    }

    if (!expense.excludePayer) {
      balances[paidBy.email] -= share;
    }
  }

  // Final step: compute settlements
  const result = [];
  const processedPairs = new Set();

  for (const debtor of Object.keys(transactions)) {
    for (const creditor of Object.keys(transactions[debtor])) {
      const pairKey = [debtor, creditor].sort().join("-");
      if (processedPairs.has(pairKey)) continue;

      const debtorAmount = transactions[debtor][creditor].amount;
      const creditorAmount = transactions[creditor]?.[debtor]?.amount || 0;
      const netAmount = debtorAmount - creditorAmount;

      let finalDebtor = debtor;
      let finalCreditor = creditor;

      if (netAmount < 0) {
        finalDebtor = creditor;
        finalCreditor = debtor;
      }

      const absoluteNetAmount = Math.abs(netAmount);
      const debtorMember = group.members.find((m) => m.email === finalDebtor);
      const creditorMember = group.members.find(
        (m) => m.email === finalCreditor
      );

      // ✅ Push all balances, just mark hidden if debtor is settled
      if (absoluteNetAmount > 0) {
        result.push({
          id: uuidv4(),
          debtor: {
            email: finalDebtor,
            name: debtorMember?.name || `${finalDebtor} (left)`,
          },
          creditor: {
            email: finalCreditor,
            name: creditorMember?.name || `${finalCreditor} (left)`,
          },
          amount: parseFloat(absoluteNetAmount.toFixed(2)),
          currency: finalCurrency,
          breakdown: [
            ...(transactions[debtor]?.[creditor]?.breakdown || []),
            ...(transactions[creditor]?.[debtor]?.breakdown || []),
          ],
          hidden: debtorMember?.userSettled === true, // ✅ Final fix
        });
      }

      processedPairs.add(pairKey);
    }
  }

  return result;
}

export function isEmail(input) {
  // Basic pattern to check if string is in email format
  const emailRegex = /\S+@\S+\.\S+/;

  // Return true if the input matches the pattern, otherwise false
  return emailRegex.test(input);
}

export async function calculateTotalsAcrossGroups(
  groups,
  yourEmail,
  finalCurrency
) {
  let totalYouGet = 0;
  let totalYouGive = 0;

  for (const group of groups) {
    const balances = await calculateSimplifiedBalances(group, finalCurrency);
    const user = group?.members.find((member) => member?.email === yourEmail);
    const amISettled = user?.userSettled || false;

    for (const balance of balances) {
      const amount =
        balance.currency !== finalCurrency
          ? (
              await convertCurrency(
                balance.amount,
                balance.currency,
                finalCurrency
              )
            ).amount
          : balance.amount;

      // ✅ You are the one who is owed money
      if (balance.creditor.email === yourEmail && !amISettled) {
        totalYouGet += parseFloat(amount);
      }

      // ✅ You are the one who has to pay
      if (balance.debtor.email === yourEmail && !amISettled) {
        totalYouGive += parseFloat(amount);
      }
    }
  }

  const totalBalance = totalYouGet - totalYouGive;

  return {
    youGet: parseFloat(totalYouGet.toFixed(2)),
    youGive: parseFloat(totalYouGive.toFixed(2)),
    balance:
      totalBalance > 0
        ? `+${totalBalance.toFixed(2)}`
        : `${totalBalance.toFixed(2)}`,
    currency: finalCurrency,
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
  console.log(apiUrl);

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
      return {
        amount: amount.toFixed(2), // No conversion needed
        toCurrency: fromCurrency,
      };
    }

    const convertedAmount = amount * rate;
    return {
      amount: convertedAmount.toFixed(2), // Format to 2 decimal places
      toCurrency,
    };
  } catch (error) {
    console.error("Error fetching currency data:", error);

    // Attempt conversion by switching from and to currencies
    const fallbackApiUrl = `https://raw.githubusercontent.com/WoXy-Sensei/currency-api/main/api/${toCurrency}_${fromCurrency}.json`;
    console.log(fallbackApiUrl);

    try {
      const fallbackResponse = await fetch(fallbackApiUrl);
      if (!fallbackResponse.ok) {
        throw new Error(`Error fetching data: ${fallbackResponse.statusText}`);
      }
      const fallbackCurrencyData = await fallbackResponse.json();
      const { rate } = fallbackCurrencyData;

      // Convert the amount with the fallback rate
      const convertedAmount = amount / rate; // Reverse the conversion
      return {
        amount: convertedAmount.toFixed(2), // Format to 2 decimal places
        toCurrency: fromCurrency, // Set the toCurrency as the original fromCurrency
      };
    } catch (fallbackError) {
      console.error("Error fetching fallback currency data:", fallbackError);
      // If both attempts fail, return the original amount with the original currency
      return {
        amount: amount.toFixed(2), // Return original amount
        toCurrency: fromCurrency,
      };
    }
  }
}

export function getCurrencySymbol(value) {
  const currency = currencies.find((currency) => currency.value === value);
  return currency ? currency.label.split(" - ")[0].trim() : null; // Return only the symbol part
}

export function getCurrencyLabel(value) {
  const currency = currencies.find((currency) => currency.value === value);

  // Return the part after the dash for the specified currency
  if (currency) {
    return currency.label.split(" - ")[1]?.trim() || null; // Return only the part after the dash
  }

  return null; // Return null if currency not found
}

export async function calculateSimplifiedBalances(group, finalCurrency) {
  // First get the normal balances
  const normalBalances = await calculateBalances(group, finalCurrency);

  // Create a map of net balances for each person
  const netBalances = new Map();

  // Calculate net balance for each person
  for (const transaction of normalBalances) {
    const { debtor, creditor, amount } = transaction;

    // Update debtor balance
    netBalances.set(
      debtor.email,
      (netBalances.get(debtor.email) || 0) - amount
    );

    // Update creditor balance
    netBalances.set(
      creditor.email,
      (netBalances.get(creditor.email) || 0) + amount
    );
  }

  // Convert to array of people with their balances
  const people = Array.from(netBalances.entries()).map(([email, balance]) => ({
    email,
    name: group.members.find((m) => m.email === email)?.name || email,
    balance,
  }));

  // Sort by balance (descending)
  people.sort((a, b) => b.balance - a.balance);

  const result = [];
  let i = 0; // index for people who are owed money (positive balance)
  let j = people.length - 1; // index for people who owe money (negative balance)

  while (i < j) {
    const creditor = people[i];
    const debtor = people[j];

    if (creditor.balance <= 0 || debtor.balance >= 0) break;

    const amount = Math.min(creditor.balance, -debtor.balance);

    // Skip very small amounts (less than 0.01)
    if (amount < 0.01) continue;

    result.push({
      id: uuidv4(),
      creditor: {
        email: creditor.email,
        name: creditor.name,
      },
      debtor: {
        email: debtor.email,
        name: debtor.name,
      },
      amount: parseFloat(amount.toFixed(2)),
      currency: finalCurrency,
      simplified: true,
    });

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j--;
  }

  return result;
}

export function formatIsoDate(isoDate) {
  const date = new Date(isoDate);

  const options = { year: "numeric", month: "long", day: "numeric" };

  return date.toLocaleDateString("en-US", options);
}
