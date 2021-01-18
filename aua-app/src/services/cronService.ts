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

const tz = 'Australia/Sydney';
const runningTasks = [];

function stopRunningTasks() {
  let task;
  while ((task = runningTasks.shift())) {
    task.stop();
  }
}

async function startRecurrings() {
  console.log('[Recurring]'.bgYellow, 'Starting cron service');

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .innerJoin(q => q.from(Portfolio, 'p'), 'p', 'p.id = x."portfolioId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .select([
      'x.*',
    ])
    .execute();

  stopRunningTasks();
  const tasks = list.map(r => startSingleRecurring(r));
  runningTasks.push(...tasks);
  console.log('[Recurring]'.bgYellow, 'Started cron service');
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

export async function executeRecurring(recurringId) {
  assert(recurringId, 400);
  const recurring = await getRepository(Recurring).findOne({ id: recurringId });
  assert(recurring, 404);
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

  return task;
}

function createCronJob(cron: string, startFrom: Date, onRunFn: () => Promise<void>): CronJob {
  let cronPattern = cron;
  let onExecuteCallback = onRunFn;
  if (/L/.test(cron)) {
    cronPattern = cron.replace('L', '28-31');
    onExecuteCallback = async () => {
      const now = moment();
      const today = now.format('D');
      const lastDayOfMonth = now.endOf('month').format('D');
      if (today === lastDayOfMonth) {
        await onRunFn();
      }
    };
  }

  const onExecuteAfterStartDate = () => {
    console.log('[Recurring]'.bgYellow, 'attempting');
    if (startFrom) {
      // startFrom is of Australia/Sydney timezone. 
      // Have to change to UTC
      const startUtcMoment = moment.tz(startFrom, tz).startOf('day');
      const now = moment();
      if (now.isAfter(startUtcMoment)) {
        onExecuteCallback();
      }
    } else {
      onExecuteCallback();
    }
  }

  const job = new CronJob(
    cronPattern,
    onExecuteAfterStartDate,
    null,
    false,
    tz
  );
  job.start();

  return job;
}

function startSingleRecurring(recurring: Recurring): CronJob {
  const { id, cron, startFrom: startFrom, taskTemplateId, portfolioId } = recurring;

  const cronJob = createCronJob(
    cron,
    startFrom,
    async () => {
      const task = await executeRecurring(id);

      const log = new SysLog();
      log.level = 'info';
      log.message = 'Recurring triggered';
      log.data = {
        recurringId: id,
        taskTemplateId,
        portfolioId,
        createdTaskId: task.id
      };

      logging(log);
    }
  );

  const log = new SysLog();
  log.level = 'info';
  log.message = 'Recurring complete';
  log.data = {
    recurringId: id,
    cron
  };
  logging(log);
  
  console.log('[Recurring]'.bgYellow, `Cron started recuring ${id} '${cron}'`);
  return cronJob;
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
      return startRecurrings();
    }
    startRecurrings();
  } catch (e) {
    const log = new SysLog();
    log.message = 'Failed to restart cron service';
    log.data = errorToJSON(e);
    logging(log);
  }
}
