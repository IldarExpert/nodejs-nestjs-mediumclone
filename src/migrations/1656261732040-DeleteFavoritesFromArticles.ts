import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteFavoritesFromArticles1656261732040 implements MigrationInterface {
    name = 'DeleteFavoritesFromArticles1656261732040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "favorited"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "favorited" boolean NOT NULL DEFAULT false`);
    }

}
