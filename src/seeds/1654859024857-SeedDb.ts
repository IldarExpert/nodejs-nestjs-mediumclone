import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1654859024857 implements MigrationInterface {
  name = 'SeedDb1654859024857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name)
                             VALUES ('dragons'),
                                    ('cofee'),
                                    ('nestjs')`);

    // password 123
    await queryRunner.query(
      `INSERT INTO users (username, email, password)
       VALUES ('Vasat', 'vasat@test.ru', '$2b$10$qYLHChZrJ4md1LSfyHO7ZOe3iTEMQL5BhPTPaQToZkT9ubVW13FYm')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
       VALUES ('fist article', 'fist article title', 'fist article description', 'fist article body', 'dragons,cofee', 10)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
       VALUES ('second article', 'second article title', 'second article description', 'second article body', 'nestjs,cofee', 10)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
       VALUES ('fird article', 'fird article title', 'fird article description', 'fird article body', 'dragons,nestjs', 10)`,
    );
  }

  public async down(): Promise<void> {
  }
}
