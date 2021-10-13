import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  street: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  zip: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country: string;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lat: number;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lng: number;

  @Field({ nullable: true })
  distance: number;
}
