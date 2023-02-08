import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCoutrytoQuestion1671044223050 implements MigrationInterface {
  name = 'addCoutrytoQuestion1671044223050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" ADD "country" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "country"`);
  }
}
