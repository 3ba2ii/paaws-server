import { LocationFilters } from './../types/types';

export const getLocationFilterBoundary = (locationFilter: LocationFilters) => {
  switch (locationFilter) {
    case LocationFilters.NEAR_ME:
      return 1;
    case LocationFilters.WITHIN_2KM:
      return 2;
    case LocationFilters.WITHIN_5KM:
      return 5;
    default:
      return 1;
  }
};
