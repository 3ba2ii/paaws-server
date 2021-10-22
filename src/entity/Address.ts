import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  street_name?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  street_number?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  zip?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  formatted_address?: string;

  @Field(() => String)
  @Column('decimal', { precision: 10, scale: 6 })
  lat: number;

  @Field(() => String)
  @Column('decimal', { precision: 10, scale: 6 })
  lng: number;

  @Field({ nullable: true })
  distance: number;
}
