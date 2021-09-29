import { User } from './../entity/UserEntities/User';
import { MyContext } from 'src/types';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Address } from './../entity/Address';

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

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;
  return d;
}
export default AddressResolver;
