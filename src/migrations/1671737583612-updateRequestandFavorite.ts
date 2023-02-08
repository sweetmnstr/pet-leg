import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRequestandFavorite1671737583612
  implements MigrationInterface
{
  name = 'updateRequestandFavorite1671737583612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_6388413f99d4d9efe296e6fdd88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_543e20855ce2bde06d0acb29b51"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_543e20855ce2bde06d0acb29b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d48db5b563a01992c6ff9e1ef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" RENAME COLUMN "requesterId" TO "requester"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" RENAME CONSTRAINT "UQ_6388413f99d4d9efe296e6fdd88" TO "UQ_622342fd30945a0c65f2240a06c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "UQ_622342fd30945a0c65f2240a06c"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_543e20855ce2bde06d0acb29b5" ON "favorite" ("customerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d48db5b563a01992c6ff9e1ef9" ON "favorite" ("lawyerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_543e20855ce2bde06d0acb29b51" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_543e20855ce2bde06d0acb29b51"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d48db5b563a01992c6ff9e1ef9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_543e20855ce2bde06d0acb29b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "UQ_622342fd30945a0c65f2240a06c" UNIQUE ("requester")`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" RENAME CONSTRAINT "UQ_622342fd30945a0c65f2240a06c" TO "UQ_6388413f99d4d9efe296e6fdd88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" RENAME COLUMN "requester" TO "requesterId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d48db5b563a01992c6ff9e1ef9" ON "favorite" ("lawyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_543e20855ce2bde06d0acb29b5" ON "favorite" ("customerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_543e20855ce2bde06d0acb29b51" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "FK_6388413f99d4d9efe296e6fdd88" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
