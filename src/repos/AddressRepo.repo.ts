import { User } from './../entity/UserEntities/User';
import { Service } from 'typedi';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { Address } from './../entity/Address';
@Service()
@EntityRepository(Address)
export class AddressRepo extends Repository<Address> {
  /**
 * Find nearest 20 users from the current location within a radius
 * @param lat: number - latitude of the current location
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
}
