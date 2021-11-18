import { DateFilters } from './../types/types';
export const getStartAndEndDateFilters = (
  filter: DateFilters
): { startDate: Date | null; endDate: Date } => {
  let startDate;
  let endDate = new Date();
  switch (filter) {
    case DateFilters.TODAY:
      startDate = new Date();
      break;
    case DateFilters.LAST_WEEK:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case DateFilters.LAST_MONTH:
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case DateFilters.LAST_YEAR:
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = null;
  }

  //to make sure that the end date includes the end of the current date
  endDate.setHours(23, 59, 59, 999);

  //to make sure that the start date begins with the start of the current date
  startDate?.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};
