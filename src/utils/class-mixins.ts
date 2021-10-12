import { Address } from '../entity/Address';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type Constructor<T = {}> = new (...args: any[]) => T;

export function EntityWithBase<TBase extends Constructor>(Base: TBase) {
  @ObjectType()
  abstract class AbstractBase extends Base {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;
  }
  return AbstractBase;
}

export function EntityWithDates<TBase extends Constructor>(Base: TBase) {
  @ObjectType()
  abstract class AbstractBase extends Base {
    @Field()
    @UpdateDateColumn()
    public updatedAt: Date;

    @Field()
    @CreateDateColumn()
    public createdAt: Date;
  }
  return AbstractBase;
}

export function EntityWithLocation<TBase extends Constructor>(Base: TBase) {
  @ObjectType()
  abstract class AbstractBase extends Base {
    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    public addressId: number;

    @Field(() => Address, { nullable: true })
    @OneToOne(() => Address, {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'addressId' })
    public address: Address;
  }
  return AbstractBase;
}

export class EmptyClass {}
