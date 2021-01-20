import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateRecurringCron1611118584487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
UPDATE public."recurring" 
SET "startFrom" = '2021-06-30 05:00:00',
"nextRunAt" = '2021-06-30 05:00:00',
"every" = 1,
period = 'year'
WHERE cron = '0 0 0 30 6 *'
        `);

        await queryRunner.query(`
UPDATE public."recurring" 
SET "startFrom" = '2021-07-01 05:00:00',
"nextRunAt" = '2021-07-01 05:00:00',
"every" = 1,
period = 'year'
WHERE cron = '0 0 0 1 7 *'
        `);

        await queryRunner.query(`
UPDATE public."recurring" 
SET "startFrom" = '2021-03-31 05:00:00',
"nextRunAt" = '2021-03-31 05:00:00',
"every" = 3,
period = 'month'
WHERE cron = '0 0 0 L */3 *'
        `);

        await queryRunner.query(`
UPDATE public."recurring" 
SET "startFrom" = '2021-01-31 05:00:00',
"nextRunAt" = '2021-01-31 05:00:00',
"every" = 1,
period = 'month'
WHERE cron = '0 0 0 L */1 *'
        `);        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
