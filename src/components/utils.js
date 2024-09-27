import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Enable the custom format parsing
dayjs.extend(customParseFormat);

const dateFormat = "MMMM D, YYYY [at] hh:mm:ss A [UTC]Z";

export const sortByDate = (array) => {
  return array.sort(
    (a, b) =>
      dayjs(b.createdDate, dateFormat).valueOf() -
      dayjs(a.createdDate, dateFormat).valueOf()
  );
};
