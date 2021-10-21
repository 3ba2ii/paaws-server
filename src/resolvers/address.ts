import { MyContext } from 'src/types';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Address } from './../entity/Address';
import { User } from './../entity/UserEntities/User';
import { calculateDistance } from '../utils/calculateDistance';

@Resolver(Address)
class AddressResolver {
  @FieldResolver()
  async distance(
    @Root() { lat, lng }: Address,
    @Ctx() { req, redis }: MyContext
  ): Promise<number | null> {
    const userId = req.session.userId;

    if (!userId) {
      return null;
    }

    let userLat: number;
    let userLng: number;

    let user: User | undefined;

    //1. Try to get the location from redis
    const userLocation = await redis.get(`userLocation${userId}`);

    //2. If Found one : Retrieve it
    if (userLocation) {
      const [latTemp, lngTemp] = userLocation.split('*');
      userLat = parseFloat(latTemp);
      userLng = parseFloat(lngTemp);
    }
    //3. In case of not found, retrieve it from the database and cache it in redis
    else {
      user = await User.findOne(userId);
      if (!user) {
        return null;
      }
      await redis.set(
        `userLocation${userId}`,
        `${user.lat}*${user.lng}`,
        'ex',
        60 * 5
      );

      userLat = user.lat;
      userLng = user.lng;
    }

    //store the user location in redis

    if (!userLat || !userLng) return null;
    return calculateDistance(userLat, userLng, lat, lng);
  }
}

export default AddressResolver;
