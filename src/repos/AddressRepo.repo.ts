import { AddressInput } from './../types/inputTypes';
import { GoogleAddressParser } from './../utils/GoogleAddressParser';
import { Language, LatLng } from '@googlemaps/google-maps-services-js';
import { Service } from 'typedi';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { createGoogleMapsClient } from '../utils/createGoogleMapsClient';
import { Address } from './../entity/Address';
import { User } from './../entity/UserEntities/User';
@Service()
@EntityRepository(Address)
export class AddressRepo extends Repository<Address> {
  async findAddressWithLatLng(
    lat: number,
    lng: number
  ): Promise<Address | null> {
    const googleMapsClient = createGoogleMapsClient();
    const latlng: LatLng = [lat, lng];

    try {
      const { status, data } = await googleMapsClient.reverseGeocode({
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY + '',
          latlng,
          language: Language.en,
        },
      });

      if (status && status === 200 && data?.results?.length) {
        //We found some locations

        //1. get the most accurate location that has the most address components
        const { address_components } = data.results.sort((a, b) =>
          a.address_components?.length < b.address_components?.length ? 1 : -1
        )[0];

        //2. get the address components
        return new GoogleAddressParser(address_components).result();
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  }
  /**
   Find nearest 20 users from the current location within a radius
   @param lat: number - latitude of the current location
   @param lng: number - longitude of the current location
   @param radius: number - radius of the search in kilometers
   @returns Promise<User[]>
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

  /**
   *
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
    if (!city || !country || !state) {
      //in case of any missing data, we need to get the address from google maps
      formattedAddress = await this.findAddressWithLatLng(lat, lng);
    } else {
      formattedAddress = Address.create({
        ...address,
      });
    }

    return formattedAddress;
  }
}
