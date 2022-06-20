import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, OneToOne } from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class UserSetting extends EntityWithBase(EntityWithDates(BaseEntity)) {
  @Field(() => Int)
  @Column({ unique: true })
  userId: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.settings) // specify inverse side as a second parameter
  user: User;

  @Field(() => Boolean)
  @Column({ default: true })
  showEmail: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  showPhone: boolean;

  @Field(() => String)
  @Column({ unique: true })
  accountURL: string;

  @Field(() => String)
  @Column()
  language: string;

  public async verifyUniqueURL(accountURL: string): Promise<boolean> {
    const trimmedURL = accountURL.trim().toLocaleLowerCase().replace(' ', '');
    const user = await UserSetting.findOne({ accountURL: trimmedURL });
    if (user) {
      return false;
    }
    return user ? false : true;
  }

  public async createUniqueAccountURL(
    full_name: string,
    tries: number
  ): Promise<string> {
    let suffix = '';
    if (tries > 0) {
      suffix = new Date().getTime().toString().slice(0, 7);
    }

    const uniqueURL =
      full_name.trim().toLocaleLowerCase().replace(' ', '') + suffix;

    const accountURL = await UserSetting.findOne({ accountURL: uniqueURL });

    if (accountURL) {
      return this.createUniqueAccountURL(full_name, tries + 1);
    }
    return uniqueURL;
  }
}
