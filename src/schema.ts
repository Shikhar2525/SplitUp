interface Group {
    id: string,
    title: string,
    members : string[]
    createdDate: Date,
    transactions: string // to be decided
    expenses : string // to be decided
    isAllSettled : boolean 
    lastUpdatedDate : Date
}