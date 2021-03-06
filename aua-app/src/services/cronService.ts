import { getRepository } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { CronJob } from 'cron';
import { SysLog } from '../entity/SysLog';
import { generateTaskByTaskTemplateAndPortfolio } from '../utils/generateTaskByTaskTemplateAndPortfolio';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import errorToJSON from 'error-to-json';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';
const PROD_CRON_PATTERN = CRON_EXECUTE_TIME.replace(/(.*):(.*)/, '0 $2 $1 * * *'); // at 5 am every day


console.log('PROD_CRON_PATTERN', PROD_CRON_PATTERN);

let cronJob = null;

function stopRunningCronJob() {
  cronJob?.stop();
}

function getCronPattern() {
  if (process.env.NODE_ENV === 'dev') {
    return '*/10 * * * * *';
  } else {
    return PROD_CRON_PATTERN;
  }
}

async function onCronJobExecute() {
  console.log('[Recurring]'.bgYellow, 'Cron job is executing');
  logging({
    message: '[Recurring] Cron job is executing'
  });

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .innerJoin(q => q.from(Portfolio, 'p'), 'p', 'p.id = x."portfolioId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .where(`x."nextRunAt" <= now()`)
    .getMany();

  for (const r of list) {
    await executeSingleRecurringFromCron(r);
  }
  console.log('[Recurring]'.bgYellow, `Cron job finished ${list.length} recurrings`);
  logging({
    message: `[Recurring] Cron job finished ${list.length} recurrings`
  });
}

function startCronJob() {
  stopRunningCronJob();

  const cronPattern = getCronPattern();
  const runImmidiately = true;
  cronJob = new CronJob(
    cronPattern,
    onCronJobExecute,
    null,
    runImmidiately,
    CLIENT_TZ
  );
  return cronJob;
}

function logging(log: {
  level?: string,
  message: string,
  data?: any
}) {
  const sysLog = new SysLog();
  sysLog.level = 'info';
  Object.assign(sysLog, log);
  sysLog.createdBy = 'cron';
  getRepository(SysLog).save(sysLog).catch(err => {
    console.error('Logging error', errorToJSON(err));
  });
}

function trySetTaskDueDateField(task: Task, dueDay: number) {
  if (!dueDay) return;
  const dueDateField = task.fields.find(x => x.name === 'Due_Date');
  if (!dueDateField) return;
  const dueDateMoment = moment().add(dueDay, 'day');
  dueDateField.value = dueDateMoment.format('DD/MM/YYYY');
  task.dueDate = dueDateMoment.toDate();
}

export async function testRunRecurring(recurringId: string) {
  const recurring = await getRepository(Recurring).findOne(recurringId);
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { taskTemplateId, portfolioId, nameTemplate } = recurring;

  const taskName = nameTemplate.replace('{{createdDate}}', moment().format('DD MMM YYYY'));
  const task = await generateTaskByTaskTemplateAndPortfolio(
    taskTemplateId,
    portfolioId,
    () => taskName
  );

  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);

  task.status = TaskStatus.TODO;

  trySetTaskDueDateField(task, recurring.dueDay);

  sendNewTaskCreatedEmail(task);

  await getRepository(Task).save(task);

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    await getRepository(Recurring).save(recurring);
  }

  return task;
}

async function executeSingleRecurringFromCron(recurring: Recurring): Promise<void> {
  const { id } = recurring;

  try {
    console.log('[Recurring]'.bgYellow, `Executing recuring ${id}`);
    await executeRecurring(recurring, true);

    logging({
      message: 'Recurring complete',
      data: {
        recurringId: id
      }
    });


    console.log('[Recurring]'.bgYellow, `Done with recuring ${id}`);
  } catch (err) {
    logging({
      level: 'error',
      message: 'Recurring error',
      data: {
        recurringId: id,
        error: errorToJSON(err)
      }
    });

    console.error('[Recurring]'.bgYellow, `Error from recuring ${id}`, err);
  }
}

export function startCronService() {
  try {
    console.log('[Recurring]'.bgYellow, `Starting cron service`);

    startCronJob();

    console.log('[Recurring]'.bgYellow, `Started cron service`);
    logging({
      message: 'Cron service started'
    });
  } catch (e) {
    console.error('[Recurring]'.bgYellow, `Failed to start cron service`, errorToJSON(e));
    logging({
      level: 'error',
      message: 'Failed to restart cron service',
      data: errorToJSON(e)
    });
  }
}
