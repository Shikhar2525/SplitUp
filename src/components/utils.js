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

      // Get settlement status for both parties
      const creditorUser = group?.members.find((member) => member?.email === balance.creditor.email);
      const isCreditorSettled = creditorUser?.userSettled || false;

      const debtorUser = group?.members.find((member) => member?.email === balance.debtor.email);
      const isDebtorSettled = debtorUser?.userSettled || false;

      // CASE 1: You are owed money (creditor)
      if (balance.creditor.email === yourEmail) {
        // Always count money owed to you, regardless of your settlement status
        // But only if the debtor isn't settled (they don't have to pay if settled)
        if (!isDebtorSettled) {
          totalYouGet += parseFloat(amount);
        }
      }

      // CASE 2: You owe money (debtor)
      if (balance.debtor.email === yourEmail) {
        // Only count if you're not settled AND the creditor isn't settled
        if (!amISettled && !isCreditorSettled) {
          totalYouGive += parseFloat(amount);
        }
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

export async function convertCurrency(amount, fromCurrency, toCurrency) {
  // If same currency, return early with rate 1
  if (fromCurrency === toCurrency) {
    return {
      fromCurrency,
      toCurrency,
      rate: 1,
      amount: amount.toFixed(2),
      lastUpdate: Date.now(),
    };
  }

  // Cache for rates to avoid repeated API calls
  const rateCache = {};
  const cacheKey = `${fromCurrency}${toCurrency}`;
  
  // Try multiple API sources with CORS support
  const apiSources = [
    // Primary: CORS-enabled Frankfurter
    async (base, target) => {
      const url = `https://api.frankfurter.app/latest?amount=1&from=${base}&to=${target}`;
      const response = await fetch(url, { 
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      if (!response.ok) throw new Error(`Frankfurter API: ${response.status}`);
      const data = await response.json();
      return data.rates?.[target];
    },
    // Secondary: Exchange-rates-api.com (with improved CORS)
    async (base, target) => {
      const url = `https://open.er-api.com/v6/latest/${base}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      if (!response.ok) throw new Error(`ERApi: ${response.status}`);
      const data = await response.json();
      return data.rates?.[target];
    },
    // Tertiary: Fallback fixed rates (approximate)
    async (base, target) => {
      const fixedRates = {
        'USD': { 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50, 'INR': 83.12, 'CAD': 1.36, 'AUD': 1.53, 'CHF': 0.89 },
        'EUR': { 'USD': 1.09, 'GBP': 0.86, 'JPY': 162.50, 'INR': 90.30, 'CAD': 1.48, 'AUD': 1.66, 'CHF': 0.97 },
        'GBP': { 'USD': 1.27, 'EUR': 1.16, 'JPY': 189.00, 'INR': 105.00, 'CAD': 1.72, 'AUD': 1.93, 'CHF': 1.13 },
        'JPY': { 'USD': 0.0067, 'EUR': 0.0062, 'GBP': 0.0053, 'INR': 0.56, 'CAD': 0.0091, 'AUD': 0.010, 'CHF': 0.0060 },
        'INR': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095, 'JPY': 1.80, 'CAD': 0.016, 'AUD': 0.018, 'CHF': 0.011 },
        'CAD': { 'USD': 0.74, 'EUR': 0.68, 'GBP': 0.58, 'JPY': 110.00, 'INR': 61.00, 'AUD': 1.12, 'CHF': 0.65 },
        'AUD': { 'USD': 0.66, 'EUR': 0.60, 'GBP': 0.52, 'JPY': 98.00, 'INR': 54.50, 'CAD': 0.89, 'CHF': 0.58 },
        'CHF': { 'USD': 1.13, 'EUR': 1.04, 'GBP': 0.88, 'JPY': 167.00, 'INR': 93.00, 'CAD': 1.53, 'AUD': 1.72 },
      };
      const rate = fixedRates[base]?.[target];
      if (!rate) throw new Error(`No fixed rate for ${base} -> ${target}`);
      return rate;
    }
  ];

  // Function to fetch rate with multiple API fallbacks
  const fetchRate = async (base, target) => {
    console.log(`Fetching rate: ${base} -> ${target}`);
    
    for (let i = 0; i < apiSources.length; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const rate = await Promise.race([
          apiSources[i](base, target),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5500))
        ]);
        
        clearTimeout(timeoutId);
        
        if (rate && rate > 0) {
          console.log(`✓ Rate found (attempt ${i + 1}): ${rate}`);
          return rate;
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error.message);
        if (i === apiSources.length - 1) {
          throw new Error(`All rate APIs failed: ${error.message}`);
        }
      }
    }
  };

  try {
    // Try direct conversion
    const rate = await fetchRate(fromCurrency, toCurrency);
    console.log("Direct conversion successful:", rate);
    
    return {
      fromCurrency,
      toCurrency,
      rate,
      amount: (amount * rate).toFixed(2),
      lastUpdate: Date.now(),
    };
  } catch (error) {
    console.error("Primary conversion failed:", error.message);
    
    try {
      // Try reverse conversion
      const reverseRate = await fetchRate(toCurrency, fromCurrency);
      const rate = 1 / reverseRate;
      console.log("Reverse conversion successful:", rate);

      return {
        fromCurrency,
        toCurrency,
        rate,
        amount: (amount * rate).toFixed(2),
        lastUpdate: Date.now(),
      };
    } catch (fallbackError) {
      console.error("All conversion attempts failed:", fallbackError.message);
      
      // Return original amount as final fallback
      console.warn("Using final fallback: no conversion applied");
      return {
        fromCurrency,
        toCurrency,
        rate: 1,
        amount: amount.toFixed(2),
        lastUpdate: Date.now(),
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
