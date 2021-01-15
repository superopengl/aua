import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminUserAdvisory1610690148409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status)
        VALUES ('9f97a42b-efea-49f3-ac72-56d5e301e715',
        'advisory@auao.com.au',
        'Orange',
        'Liew',
        'd5bba80a0ddb7d33077734a02e68c8cbc5376f7813bd2991992da16d13cc9c00',
        '994b39b5-6069-4eca-b3e5-236f2199c03a',
        'admin',
        'enabled'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
