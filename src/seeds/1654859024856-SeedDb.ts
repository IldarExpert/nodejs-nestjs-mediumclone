import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1654859024855 implements MigrationInterface {
  name = 'SeedDb1654859024855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name)
                             VALUES ('dragons'),
                                    ('cofee'),
                                    ('nestjs')`);
  }

  public async down(): Promise<void> {
  }
}
