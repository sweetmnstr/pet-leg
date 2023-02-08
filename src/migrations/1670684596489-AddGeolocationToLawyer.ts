import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeolocationToLawyer1670684596489 implements MigrationInterface {
  name = 'AddGeolocationToLawyer1670684596489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "geolocation" ADD "lawyerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "geolocation" ADD CONSTRAINT "UQ_1dbb5ba4bc0a8d8406e3c46970b" UNIQUE ("lawyerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "geolocation" ADD CONSTRAINT "FK_1dbb5ba4bc0a8d8406e3c46970b" FOREIGN KEY ("lawyerId") REFERENCES "lawyer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "geolocation" DROP CONSTRAINT "FK_1dbb5ba4bc0a8d8406e3c46970b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "geolocation" DROP CONSTRAINT "UQ_1dbb5ba4bc0a8d8406e3c46970b"`,
    );
    await queryRunner.query(`ALTER TABLE "geolocation" DROP COLUMN "lawyerId"`);
  }
}
