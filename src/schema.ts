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
