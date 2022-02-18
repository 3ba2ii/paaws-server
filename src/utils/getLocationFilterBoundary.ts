import { LocationFilters } from '../types/enums.types';

export const getLocationFilterBoundary = (locationFilter: LocationFilters) => {
  switch (locationFilter) {
    case LocationFilters.NEAR_ME:
      return 1;
    case LocationFilters.WITHIN_5KM:
      return 5;
    case LocationFilters.WITHIN_10KM:
      return 10;
    default:
      return 10;
  }
};
