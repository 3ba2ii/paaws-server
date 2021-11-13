import { AddressInput } from './../types/inputTypes';
import { GoogleAddressParser } from './../utils/GoogleAddressParser';
import {
  GeocodeComponents,
  Language,
  LatLng,
} from '@googlemaps/google-maps-services-js';
import { Service } from 'typedi';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { createGoogleMapsClient } from '../utils/createGoogleMapsClient';
import { Address } from './../entity/Address';
import { User } from './../entity/UserEntities/User';
@Service()
@EntityRepository(Address)
export class AddressRepo extends Repository<Address> {
  private readonly API_KEY = process.env.GOOGLE_MAPS_API_KEY + '';
  private readonly googleMapsClient = createGoogleMapsClient();

  /**
   * This method will return the latitude and longitude for the given address components
   * @param address - The user's address components
   * @example
   * const components = {
      country: 'Egypt',
      locality: 'Al Gharbiya',
      administrative_area: 'country',
      route: 'Tanta',
    }
   * const {lat,lng} = await this.findLatLngWithComponents(components)
   */
  async findLatLngWithComponents(
    components: GeocodeComponents
  ): Promise<LatLng | null> {
    if (!components) return null;
    try {
      const { data, status } = await this.googleMapsClient.geocode({
        params: { key: this.API_KEY, components },
      });
      if (status && status === 200 && data?.results?.length) {
        //We found some locations
        const { lat, lng } = data.results[0].geometry.location;

        return { lat, lng };
      }
    } catch (e) {
      console.error(e.message);
    }
    return null;
  }

  /**
   * This method will return the latitude and longitude for the given address string
   * @param address - The user's address input for example
   * @example
   * const {lat,lng} = this.findLatLngWithStringAddress('High Ridge Drive Gloucester')
   */
  async findLatLngWithStringAddress(address: string): Promise<LatLng | null> {
    if (!address) return null;

    try {
      const { data, status } = await this.googleMapsClient.geocode({
        params: { key: this.API_KEY, address },
      });

      if (status && status === 200 && data?.results?.length) {
        //We found some locations
        const { lat, lng } = data.results[0].geometry.location;

        return { lat, lng };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async findAddressWithLatLng(
    lat: number,
    lng: number
  ): Promise<Address | null> {
    const latlng: LatLng = [lat, lng];

    try {
      const { status, data } = await this.googleMapsClient.reverseGeocode({
        params: {
          key: this.API_KEY,
          latlng,
          language: Language.en,
        },
      });

      if (status && status === 200 && data?.results?.length) {
        //1. get the most accurate location that has the most address components
        const { address_components } = [...data.results].sort((a, b) =>
          a.address_components?.length < b.address_components?.length ? 1 : -1
        )[0];

        //2. get the address components
        const address = new GoogleAddressParser(address_components).result();
        address.lat = lat;
        address.lng = lng;

        return address;
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  }
  /**
   * @param address - The user's address input
   * @returns {Promise<Address | null>} - The created address object
   */
  public async createFormattedAddress(
    address: Partial<AddressInput>
  ): Promise<Address | null> {
    const { city, country, lat, lng, state } = address;
    let formattedAddress: Address | null = null;
    if (!lat || !lng) {
      return formattedAddress;
    }
    console.log(
      `🚀 ~ file: AddressRepo.repo.ts ~ line 119 ~ AddressRepo ~ lat`,
      lat,
      lng
    );
    if (!city || !country || !state) {
      //in case of any missing data, we need to get the address from google maps
      formattedAddress = await this.findAddressWithLatLng(lat, lng);
      console.log(
        `🚀 ~ file: AddressRepo.repo.ts ~ line 133 ~ AddressRepo ~ formattedAddress`,
        formattedAddress
      );
    } else {
      formattedAddress = Address.create({
        ...address,
        lat,
        lng,
      });
    }

    return formattedAddress;
  }
  /**
   Find nearest 20 users from the current location within a radius
   @param lat: number - latitude of the current location
   @param lng: number - longitude of the current location
   @param radius: number - radius of the search in kilometers
   @returns Promise<User[]> - The nearest 20 users
 */
  async findNearestUsers(
    lat: number,
    lng: number,
    radius: number
  ): Promise<User[]> {
    const sql = `
        select * 
        from 
        (
          SELECT 
          id, email,phone,full_name,lat,lng,
          (
            6371 *
            acos(cos(radians(${lat})) * 
            cos(radians(lat)) * 
            cos(radians(lng) - 
            radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(lat)))
        ) AS distance 
        from public."user"
        ) as innerTable
        where distance < ${Math.min(radius, 5)}
        ORDER BY distance
        limit 20;`;

    const users = (await getConnection().query(sql)) as User[];
    return users;
  }
}
