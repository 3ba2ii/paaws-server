import { EntityWithBase } from '../../utils/class-mixins';
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity, Column, Entity } from 'typeorm';

enum SettingDescription {
  SHOW_EMAIL = 'show_email',
  SHOW_PHONE_NUMBER = 'show_phone_number',
  ACCOUNT_URL = 'account_url',
  LANGUAGE = 'language',
}
registerEnumType(SettingDescription, {
  name: 'SettingDescription',
  description: 'The SettingDescription for each setting',
});
/*     
        1. account-url
        2. show-email
        3. show-phone-number
        4. Language         
*/

@ObjectType()
@Entity()
export class Setting extends EntityWithBase(BaseEntity) {
  @Field(() => SettingDescription)
  @Column({ type: 'enum', enum: SettingDescription })
  description: SettingDescription;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  constrained: boolean;

  @Field()
  @Column({ type: 'varchar' })
  dataType: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  minValue?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  maxValue?: number;
}
