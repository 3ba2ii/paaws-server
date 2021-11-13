import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1636472062610 implements MigrationInterface {
  name = 'Initial1636472062610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "address" ("id" SERIAL NOT NULL, "street_name" character varying, "street_number" integer, "city" character varying, "state" character varying, "zip" character varying, "country" character varying, "formatted_address" character varying, "lat" numeric(10,6) NOT NULL, "lng" numeric(10,6) NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "notification_notificationtype_enum" AS ENUM('UPVOTE', 'DOWNVOTE', 'COMMENT_NOTIFICATION', 'REPLY_NOTIFICATION', 'MISSING_PET_AROUND_YOU')`
    );
    await queryRunner.query(
      `CREATE TYPE "notification_contenttype_enum" AS ENUM('POST', 'COMMENT', 'USER')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notification" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isRead" boolean NOT NULL DEFAULT false, "message" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "userId" integer NOT NULL, "notificationType" "notification_notificationtype_enum" NOT NULL, "contentType" "notification_contenttype_enum" NOT NULL, "contentId" integer NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "photo" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "filename" character varying NOT NULL, "path" character varying, "isOnDisk" boolean NOT NULL DEFAULT true, "isThumbnail" boolean NOT NULL DEFAULT false, "creatorId" integer, CONSTRAINT "PK_723fa50bf70dcfd06fb5a44d4ff" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pet_images" ("petId" integer NOT NULL, "photoId" integer NOT NULL, CONSTRAINT "REL_da9644c1c13b9dfe3cb6b90649" UNIQUE ("photoId"), CONSTRAINT "PK_2865a46b6a82150f96c11456e26" PRIMARY KEY ("petId", "photoId"))`
    );
    await queryRunner.query(
      `CREATE TYPE "Breeds" AS ENUM('bulldog', 'huskey')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pet_breed" ("petId" integer NOT NULL, "breed" "Breeds" NOT NULL, CONSTRAINT "PK_d8c7e6a90d7e01819582b247484" PRIMARY KEY ("petId", "breed"))`
    );
    await queryRunner.query(
      `CREATE TYPE "Pet_Colors" AS ENUM('red', 'blue', 'green')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pet_color" ("petId" integer NOT NULL, "color" "Pet_Colors" NOT NULL, CONSTRAINT "PK_200ddf060884b200e873547b0b1" PRIMARY KEY ("petId", "color"))`
    );
    await queryRunner.query(
      `CREATE TYPE "pet_type_enum" AS ENUM('dog', 'cat', 'rabbit')`
    );
    await queryRunner.query(
      `CREATE TYPE "pet_gender_enum" AS ENUM('male', 'female', 'other')`
    );
    await queryRunner.query(
      `CREATE TYPE "pet_size_enum" AS ENUM('sm', 'md', 'lg')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pet" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "type" "pet_type_enum" NOT NULL, "gender" "pet_gender_enum" NOT NULL, "size" "pet_size_enum" NOT NULL, "birthDate" TIMESTAMP NOT NULL, "vaccinated" boolean, "spayedOrNeutered" boolean, "about" character varying NOT NULL, "userId" integer NOT NULL, "thumbnailId" integer, CONSTRAINT "REL_40734110f8582f54c03aec4e5f" UNIQUE ("thumbnailId"), CONSTRAINT "PK_b1ac2e88e89b9480e0c5b53fa60" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "adoption_post" ("id" SERIAL NOT NULL, "addressId" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "petId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "REL_83ce5a69bcd0d81050bad6c12f" UNIQUE ("addressId"), CONSTRAINT "REL_1fb76a6f864aa223d144617c17" UNIQUE ("petId"), CONSTRAINT "PK_7919ae7210dbcbbec98b55f9906" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_favorites" ("userId" integer NOT NULL, "petId" integer NOT NULL, CONSTRAINT "PK_741b95cd3d269feced46542806c" PRIMARY KEY ("userId", "petId"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_pet" ("userId" integer NOT NULL, "petId" integer NOT NULL, CONSTRAINT "REL_0bc6a403d8216ab10f2f025451" UNIQUE ("petId"), CONSTRAINT "PK_dc4324972daa98568584fd69be4" PRIMARY KEY ("userId", "petId"))`
    );
    await queryRunner.query(
      `CREATE TYPE "user_tag_tagname_enum" AS ENUM('Cat Person', 'Dog Person', 'Adopter', 'Animal Friend', 'Animal Partner', 'Animal Owner', 'Animal Owner & Adopter')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_tag" ("userId" integer NOT NULL, "tagName" "user_tag_tagname_enum" NOT NULL, CONSTRAINT "PK_a82d168436b8c48dcbab76389db" PRIMARY KEY ("userId", "tagName"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user" ("addressId" integer, "id" SERIAL NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "phone" character varying NOT NULL, "full_name" character varying NOT NULL, "provider" character varying NOT NULL DEFAULT 'local', "provider_id" integer, "lat" numeric(10,6), "lng" numeric(10,6), "bio" character varying, "confirmed" boolean NOT NULL DEFAULT false, "blocked" boolean NOT NULL DEFAULT false, "last_login" TIMESTAMP, "password" character varying NOT NULL, "avatarId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "REL_217ba147c5de6c107f2fa7fa27" UNIQUE ("addressId"), CONSTRAINT "REL_58f5c71eaab331645112cf8cfa" UNIQUE ("avatarId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "post_updoot" ("updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "value" integer NOT NULL, "changes" integer NOT NULL DEFAULT '0', "postId" integer NOT NULL, CONSTRAINT "PK_4c66f4349aeab3b4f9799aa2e27" PRIMARY KEY ("userId", "postId"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "post_images" ("postId" integer NOT NULL, "photoId" integer NOT NULL, CONSTRAINT "REL_8a5b7e26858b5eb043ce2b9908" UNIQUE ("photoId"), CONSTRAINT "PK_3aa97a53b8accbea293f4c08039" PRIMARY KEY ("postId", "photoId"))`
    );
    await queryRunner.query(
      `CREATE TYPE "missing_post_privacy_enum" AS ENUM('public', 'private', 'only_me')`
    );
    await queryRunner.query(
      `CREATE TYPE "missing_post_type_enum" AS ENUM('missing', 'found', 'rescued', 'All')`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "missing_post" ("id" SERIAL NOT NULL, "addressId" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "privacy" "missing_post_privacy_enum" DEFAULT 'public', "type" "missing_post_type_enum" DEFAULT 'missing', "points" integer NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "thumbnailId" integer, CONSTRAINT "REL_583c9b02331fdb7c28a1bdcc25" UNIQUE ("addressId"), CONSTRAINT "REL_0e84abeabb4844d84e2d563a2f" UNIQUE ("thumbnailId"), CONSTRAINT "PK_218ad2ead5f6086cbd2dd4abb02" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "comment_updoot" ("updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "value" integer NOT NULL, "changes" integer NOT NULL DEFAULT '0', "commentId" integer NOT NULL, CONSTRAINT "PK_c991c46466783171c8a7a96fd0f" PRIMARY KEY ("userId", "commentId"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "comment" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, "repliesCount" integer NOT NULL DEFAULT '0', "text" character varying NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "points" integer NOT NULL DEFAULT '0', "isEdited" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "photo" ADD CONSTRAINT "FK_1127129cf8c05d8cd7a13ef52d2" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_images" ADD CONSTRAINT "FK_3cc6f9eb2738c8dda66cd99bb3c" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_images" ADD CONSTRAINT "FK_da9644c1c13b9dfe3cb6b90649c" FOREIGN KEY ("photoId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_breed" ADD CONSTRAINT "FK_0469808976df9c510e51dea2943" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_color" ADD CONSTRAINT "FK_d9bb409a1024f4fee4272ad2d68" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet" ADD CONSTRAINT "FK_4eb3b1eeefc7cdeae09f934f479" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pet" ADD CONSTRAINT "FK_40734110f8582f54c03aec4e5fd" FOREIGN KEY ("thumbnailId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" ADD CONSTRAINT "FK_83ce5a69bcd0d81050bad6c12fb" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" ADD CONSTRAINT "FK_1fb76a6f864aa223d144617c17e" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" ADD CONSTRAINT "FK_4a61b4349246a61dc4b8671ee79" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_1dd5c393ad0517be3c31a7af836" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_pet" ADD CONSTRAINT "FK_ebe33c2930f0ca05db7f5342837" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_pet" ADD CONSTRAINT "FK_0bc6a403d8216ab10f2f0254514" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_tag" ADD CONSTRAINT "FK_7cf25d8a11ccc18f04cbd8cb46c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5" FOREIGN KEY ("avatarId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_updoot" ADD CONSTRAINT "FK_97785238f2d0f7f72c37f387d2b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_updoot" ADD CONSTRAINT "FK_f197a0b506ef227740413fd69dc" FOREIGN KEY ("postId") REFERENCES "missing_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_images" ADD CONSTRAINT "FK_92e2382a7f43d4e9350d591fb6a" FOREIGN KEY ("postId") REFERENCES "missing_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_images" ADD CONSTRAINT "FK_8a5b7e26858b5eb043ce2b99086" FOREIGN KEY ("photoId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" ADD CONSTRAINT "FK_583c9b02331fdb7c28a1bdcc251" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" ADD CONSTRAINT "FK_6d746770f7a0900f0d8a68b7fa6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" ADD CONSTRAINT "FK_0e84abeabb4844d84e2d563a2f9" FOREIGN KEY ("thumbnailId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_updoot" ADD CONSTRAINT "FK_c037dfddcb2d0b259bb49d0d143" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_updoot" ADD CONSTRAINT "FK_3a1b3e9e4fba4b428d9da203e7d" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "missing_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_updoot" DROP CONSTRAINT "FK_3a1b3e9e4fba4b428d9da203e7d"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_updoot" DROP CONSTRAINT "FK_c037dfddcb2d0b259bb49d0d143"`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" DROP CONSTRAINT "FK_0e84abeabb4844d84e2d563a2f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" DROP CONSTRAINT "FK_6d746770f7a0900f0d8a68b7fa6"`
    );
    await queryRunner.query(
      `ALTER TABLE "missing_post" DROP CONSTRAINT "FK_583c9b02331fdb7c28a1bdcc251"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_images" DROP CONSTRAINT "FK_8a5b7e26858b5eb043ce2b99086"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_images" DROP CONSTRAINT "FK_92e2382a7f43d4e9350d591fb6a"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_updoot" DROP CONSTRAINT "FK_f197a0b506ef227740413fd69dc"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_updoot" DROP CONSTRAINT "FK_97785238f2d0f7f72c37f387d2b"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_tag" DROP CONSTRAINT "FK_7cf25d8a11ccc18f04cbd8cb46c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_pet" DROP CONSTRAINT "FK_0bc6a403d8216ab10f2f0254514"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_pet" DROP CONSTRAINT "FK_ebe33c2930f0ca05db7f5342837"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_1dd5c393ad0517be3c31a7af836"`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" DROP CONSTRAINT "FK_4a61b4349246a61dc4b8671ee79"`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" DROP CONSTRAINT "FK_1fb76a6f864aa223d144617c17e"`
    );
    await queryRunner.query(
      `ALTER TABLE "adoption_post" DROP CONSTRAINT "FK_83ce5a69bcd0d81050bad6c12fb"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet" DROP CONSTRAINT "FK_40734110f8582f54c03aec4e5fd"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet" DROP CONSTRAINT "FK_4eb3b1eeefc7cdeae09f934f479"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_color" DROP CONSTRAINT "FK_d9bb409a1024f4fee4272ad2d68"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_breed" DROP CONSTRAINT "FK_0469808976df9c510e51dea2943"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_images" DROP CONSTRAINT "FK_da9644c1c13b9dfe3cb6b90649c"`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_images" DROP CONSTRAINT "FK_3cc6f9eb2738c8dda66cd99bb3c"`
    );
    await queryRunner.query(
      `ALTER TABLE "photo" DROP CONSTRAINT "FK_1127129cf8c05d8cd7a13ef52d2"`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "comment_updoot"`);
    await queryRunner.query(`DROP TABLE "missing_post"`);
    await queryRunner.query(`DROP TYPE "missing_post_type_enum"`);
    await queryRunner.query(`DROP TYPE "missing_post_privacy_enum"`);
    await queryRunner.query(`DROP TABLE "post_images"`);
    await queryRunner.query(`DROP TABLE "post_updoot"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_tag"`);
    await queryRunner.query(`DROP TYPE "user_tag_tagname_enum"`);
    await queryRunner.query(`DROP TABLE "user_pet"`);
    await queryRunner.query(`DROP TABLE "user_favorites"`);
    await queryRunner.query(`DROP TABLE "adoption_post"`);
    await queryRunner.query(`DROP TABLE "pet"`);
    await queryRunner.query(`DROP TYPE "pet_size_enum"`);
    await queryRunner.query(`DROP TYPE "pet_gender_enum"`);
    await queryRunner.query(`DROP TYPE "pet_type_enum"`);
    await queryRunner.query(`DROP TABLE "pet_color"`);
    await queryRunner.query(`DROP TYPE "Pet_Colors"`);
    await queryRunner.query(`DROP TABLE "pet_breed"`);
    await queryRunner.query(`DROP TYPE "Breeds"`);
    await queryRunner.query(`DROP TABLE "pet_images"`);
    await queryRunner.query(`DROP TABLE "photo"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "notification_contenttype_enum"`);
    await queryRunner.query(`DROP TYPE "notification_notificationtype_enum"`);
    await queryRunner.query(`DROP TABLE "address"`);
  }
}
