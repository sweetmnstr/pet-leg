import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotification1670686442562 implements MigrationInterface {
  name = 'CreateNotification1670686442562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('New admin registered', 'New moderator registered', 'Lawyer sent message', 'Lawyer rejected consultation', 'Lawyer reschedule consultation', 'Provide the consultation feedback (in 24 hours push)', 'Lawyer approved time for consultation', 'Lawyer added the link', 'Customer sent message', 'Customer scheduled consultation', 'Customer rejected consultation', 'Customer reschedule consultation', 'Customer approved new time for consultation', 'Customer added feedback', 'Customer added the link', 'Customer marked consultation as Completed', 'Moderator sent the message', 'Moderator approved your post', 'Moderator rejected your post', 'Moderator approved your changes', 'Moderator rejected your changes', 'User messaged in general chat', 'Lawyer sent request for post publishing', 'Lawyer sent request for changing information')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "content" text NOT NULL, "link" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiredAt" TIME WITH TIME ZONE NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "userId" integer, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
  }
}
