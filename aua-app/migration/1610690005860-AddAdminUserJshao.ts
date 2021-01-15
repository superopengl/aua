import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminUsers1610690005860 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status)
        VALUES ('8e6b9bb1-a042-495d-be9a-2bf2f7501fef',
        'jshao@auao.com.au',
        'Jun',
        'Shao',
        '4c252c6a069e0a26550ee0d945f9afe70c6f7efb826bae5a97918594e7bf4ccd',
        '543d25c4-7e0d-433a-9d94-482df7968e81',
        'admin',
        'enabled'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
