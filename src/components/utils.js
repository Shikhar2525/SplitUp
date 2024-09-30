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
