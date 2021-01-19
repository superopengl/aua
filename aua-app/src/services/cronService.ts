import { getRepository, Not, Equal } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { CronJob } from 'cron';
import { SysLog } from '../entity/SysLog';
import { generateTaskByTaskTemplateAndPortfolio } from '../utils/generateTaskByTaskTemplateAndPortfolio';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import errorToJSON from 'error-to-json';
import { getUtcNow } from '../utils/getUtcNow';
import { CronLock } from '../entity/CronLock';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import * as os from 'os';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';

export const CLIENT_TZ = 'Australia/Sydney';
export const CRON_EXECUTE_TIME = '5:00';
const CRON_PATTERN = '5:00'.replace(/(.*):(.*)/, '0 $2 $1 * * *'); // 5 am every day

let cronJob = null;

function stopRunningCronJob() {
  cronJob?.stop();
}

async function startCronJob() {
  stopRunningCronJob();
  cronJob = new CronJob(
    CRON_PATTERN,
    onCronJobExecute,
    null,
    true,
    CLIENT_TZ
  );
  return cronJob;
}

async function onCronJobExecute() {
  console.log('[Recurring]'.bgYellow, 'Cron job is executing');

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .innerJoin(q => q.from(Portfolio, 'p'), 'p', 'p.id = x."portfolioId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .getMany();

  for (const r of list) {
    await executeSingleRecurringFromCron(r);
  }
  console.log('[Recurring]'.bgYellow, 'Cron job finished');
}

function logging(log: SysLog) {
  getRepository(SysLog).save(log).catch(() => { });
}

function trySetTaskDueDateField(task, dueDay) {
  if (!dueDay) return;
  const dueDateField = task.fields.find(x => x.name === 'Due_Date');
  if (!dueDateField) return;
  dueDateField.value = moment().add(dueDay, 'day').toDate();
}

export async function testRunRecurring(recurringId) {
  const recurring = await getRepository(Recurring).findOne(recurringId);
  assert(recurring, 404);
  return executeRecurring(recurringId, false);
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

    const log = new SysLog();
    log.level = 'info';
    log.message = 'Recurring complete';
    log.data = {
      recurringId: id,
    };
    logging(log);

    console.log('[Recurring]'.bgYellow, `Done with recuring ${id}`);
  } catch (err) {
    const log = new SysLog();
    log.level = 'error';
    log.message = 'Recurring error';
    log.data = {
      recurringId: id,
      error: errorToJSON(err)
    };
    logging(log);

    console.error('[Recurring]'.bgYellow, `Error from recuring ${id}`, err);
  }
}

async function raceSingletonLock(): Promise<boolean> {
  const gitHash = process.env.GIT_HASH;
  if (!gitHash) {
    throw new Error(`Env var 'GIT_HASH' is not specified`);
  }
  if (process.env.NODE_ENV === 'dev') {
    return true;
  }

  const hostname = os.hostname();
  const repo = getRepository(CronLock);
  const key = 'cron-singleton-lock';
  const result = await repo.update(
    {
      key,
      gitHash: Not(Equal(gitHash))
    },
    {
      gitHash,
      lockedAt: getUtcNow(),
      winner: hostname
    }
  );
  const won = result.affected === 1;

  if (!won) {
    const entity = await repo.findOne({ key });
    if (entity) {
      entity.loser = hostname;
      await repo.save(entity);
    }
  }

  return won;
}

export async function restartCronService(throws = false) {
  try {
    const shouldStart = await raceSingletonLock();
    if (!shouldStart) {
      return;
    }

    if (throws) {
      return startCronJob();
    }
    startCronJob();
  } catch (e) {
    const log = new SysLog();
    log.message = 'Failed to restart cron service';
    log.data = errorToJSON(e);
    logging(log);
  }
}
