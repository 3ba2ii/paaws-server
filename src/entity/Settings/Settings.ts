import { EntityWithBase } from '../../utils/class-mixins';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity } from 'typeorm';

@ObjectType()
@Entity()
export class Setting extends EntityWithBase(BaseEntity) {
  @Field()
  @Column({ type: 'varchar' })
  description: string;

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
