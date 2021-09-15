import { sendSMS } from './../utils/sendSMS';
import { VERIFY_PHONE_NUMBER_PREFIX } from './../constants';
import { MyContext } from './../types';
import { User } from './../entity/User';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

@InputType()
class RegisterOptions {
  @Field()
  full_name!: string;

  @Field()
  phone!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  otp!: number;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class RegularResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { defaultValue: false })
  success: boolean;
}

@Resolver(User)
class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Mutation(() => RegularResponse)
  async sendOTP(
    @Arg('phone') phone: string,
    @Ctx() { redis }: MyContext
  ): Promise<RegularResponse> {
    //DONE 1. verify that this is a valid phone number
    //DONE 2. verify the phone number that is not already registered
    //DONE 3. send the otp to the phone number

    var otp = Math.floor(1000 + Math.random() * 9000);

    const phoneNumberRegExp = new RegExp(
      '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'
    );

    if (!phoneNumberRegExp.test(phone)) {
      return {
        success: false,
        errors: [
          {
            message: 'Phone number is not valid',
            field: 'phone',
          },
        ],
      };
    }

    const user = await User.findOne({ where: { phone } });

    if (user) {
      return {
        success: false,
        errors: [
          {
            message: 'Phone number is already registered',
            field: 'phone',
          },
        ],
      };
    }

    await redis.set(VERIFY_PHONE_NUMBER_PREFIX + phone, otp, 'ex', 60 * 10);
    await sendSMS(`Your OTP is ${otp}`, phone);

    return { success: true };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('registerOptions') registerOptions: RegisterOptions,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { email, full_name, otp, password, phone } = registerOptions;

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: password,
      phone,
    });

    await user.save();

    return {
      user,
    };
  }
}

export default UserResolver;
