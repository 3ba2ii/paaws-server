import { isValidPhoneNumber } from './../middleware/isValid';
import { sendSMS } from './../utils/sendSMS';
import { VERIFY_PHONE_NUMBER_PREFIX } from './../constants';
import { MyContext } from './../types';
import argon2 from 'argon2';
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
  UseMiddleware,
} from 'type-graphql';
import { MaxLength, Length, IsMobilePhone, IsEmail } from 'class-validator';

@InputType()
class RegisterOptions {
  @Field()
  @MaxLength(100)
  full_name!: string;

  @Field()
  @IsMobilePhone('ar-EG', {
    strictMode: true,
  })
  phone!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 40)
  password!: string;

  @Field()
  @Length(4, 4, {
    message: 'OTP must be 4 characters',
    context: { key: 'otp' },
  })
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
  @UseMiddleware(isValidPhoneNumber)
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
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    const { email, full_name, otp, password, phone } = registerOptions;

    const redisKey = VERIFY_PHONE_NUMBER_PREFIX + phone;
    const storedOTP = await redis.get(redisKey);

    const isValidOTP = storedOTP?.toString() === otp.toString();

    if (!isValidOTP || !storedOTP) {
      return {
        errors: [{ field: 'otp', message: 'Invalid OTP' }],
      };
    }

    const hashedPassword = await argon2.hash(password);

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
    });

    try {
      await user.save();
      await redis.del(redisKey);

      req.session!.userId = user.id;

      return { user };
    } catch (err) {
      const errors = checkDuplicationError(err);
      return {
        errors,
      };
    }
  }
}

const checkDuplicationError = (err: any): FieldError[] => {
  const errors: FieldError[] = [];

  if (err.detail.includes('already exists')) {
    if (err.detail.includes('email')) {
      errors.push({
        field: 'email',
        message: 'Email already exists',
      });
    }
    if (err.detail.includes('phone')) {
      errors.push({
        field: 'phone',
        message: 'Phone Number already exists',
      });
    }
  }
  return errors;
};
export default UserResolver;
