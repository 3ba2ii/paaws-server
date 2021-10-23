import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Notification } from './../entity/Notification/Notification';

@Resolver(Notification)
export class NotificationResolver {
  @FieldResolver(() => String)
  async url(@Root() { contentId }: Notification) {
    //everything is a post for now so we can just use the post id
    //later we will add a switch case for each type of content
    let url = `localhost:3000/posts/${contentId}`;

    return url;
  }
}
