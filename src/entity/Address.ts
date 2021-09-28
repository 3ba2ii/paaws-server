import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column()
  street: string;

  @Field({ nullable: true })
  @Column()
  city: string;

  @Field({ nullable: true })
  @Column()
  state: string;

  @Field({ nullable: true })
  @Column()
  zip: string;

  @Field({ nullable: true })
  @Column()
  country: string;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lat: number;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lng: number;
}
