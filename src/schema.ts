interface User {
  id: string;
  firstName: string;
  lastName: string;
  joinedDate: Date;
  profilePicture: string;
  email: string;
  groups: Group[];
}

interface Group {
  id: string;
  title: string;
  members: User[];
  createdDate: Date;
  expenses: Expense[];
  isAllSettled: boolean;
  admin: User;
}

interface Expense {
  id: string;
  groupId: string;
  createdBy: User;
  amount: number;
  description?: string;
  dateCreated: Date;
  splitBetween: User[];
  paidBy: User;
}

const sampleActivityData = [
  {
    logId: "log-1",
    logType: "createGroup",
    details: {
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
  {
    logId: "log-2",
    logType: "deleteGroup",
    details: {
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
  {
    logId: "log-3",
    logType: "addUser",
    details: {
      userAffected: "abc@123.com",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
  {
    logId: "log-4",
    logType: "deleteUser",
    details: {
      userAffected: "abc@123.com",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
  {
    logId: "log-5",
    logType: "addExpense",
    details: {
      expenseTitle: "hotel bookings",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
      amount: 100,
      splitBetween: ["user1", "user2"],
    },
  },
  {
    logId: "log-6",
    logType: "deleteExpense",
    details: {
      expenseTitle: "hotel bookings",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
      amount: 100,
    },
  },
  {
    logId: "log-7",
    logType: "settle",
    details: {
      userAffected: "shikhar.mandloi@gmail.com",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
  {
    logId: "log-8",
    logType: "unSettle",
    details: {
      userAffected: "shikhar.mandloi@gmail.com",
      performedBy: "shikhar.mandloi@gmail.com",
      date: "2024-09-10",
      groupTitle: "Trip to manali",
      groupId: "dssd-ds23dc-cxcsd32",
    },
  },
];
