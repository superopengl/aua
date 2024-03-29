
import * as moment from 'moment';
import { getManager, getRepository, Not, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Task } from '../entity/Task';
import { Message } from '../entity/Message';
import { User } from '../entity/User';
import { TaskStatus } from '../types/TaskStatus';
import { sendEmail } from '../services/emailService';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { generateTaskByTaskTemplateAndPortfolio } from '../utils/generateTaskByTaskTemplateAndPortfolio';
import { getNow } from '../utils/getNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { Portfolio } from '../entity/Portfolio';
import * as _ from 'lodash';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import { sendCompletedEmail } from '../utils/sendCompletedEmail';
import { sendArchiveEmail } from '../utils/sendArchiveEmail';
import { sendRequireSignEmail } from '../utils/sendRequireSignEmail';
import { sendTodoEmail } from '../utils/sendTodoEmail';
import { TaskComment } from '../entity/TaskComment';
import { sendSignedEmail } from '../utils/sendSignedEmail';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';

export const generateTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { taskTemplateId, portfolioId } = req.body;

  const Task = await generateTaskByTaskTemplateAndPortfolio(
    taskTemplateId,
    portfolioId,
    (j, p) => `${p.name} ${j.name}`
  );

  res.json(Task);
});

async function handleTaskStatusChange(oldStatus: TaskStatus, task: Task) {
  const { status } = task;
  if (oldStatus === status) return;

  if (!oldStatus) {
    // New task
    await sendNewTaskCreatedEmail(task);
  } else if (status === TaskStatus.TODO) {
    // Task todo
    await sendTodoEmail(task);
  } else if (status === TaskStatus.SIGNED) {
    // Task signed
    await sendSignedEmail(task);
  } else if (status === TaskStatus.COMPLETE) {
    // Task completed
    await sendCompletedEmail(task);
  } else if (status === TaskStatus.TO_SIGN) {
    const hasDocToSign = task.docs?.filter(d => d.fileId && d.requiresSign && !d.signedAt).length;
    assert(hasDocToSign, 400, 'Cannot change status because there is no document to sign.');
    // Require sign
    await sendRequireSignEmail(task);
  } else if (status === TaskStatus.ARCHIVE) {
    // Archived
    await sendArchiveEmail(task);
  }
}

export const saveTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');

  const { } = req as any;

  const { id, name, taskTemplateId, portfolioId, fields, status, docs } = req.body;
  assert(name, 400, 'name is empty');

  const portfolio = await getRepository(Portfolio).findOne(portfolioId);
  assert(name, 404, 'portfolio is not found');

  const repo = getRepository(Task);
  let oldStatus;
  let task: Task;
  if (id) {
    // Existing task save
    task = await repo.findOne(id);
    assert(task, 404, 'Task is not found');
    oldStatus = task.status;
  } else {
    // New task
    task = new Task();
    task.id = uuidv4();
    task.userId = portfolio.userId;
    task.taskTemplateId = taskTemplateId;
    task.portfolioId = portfolioId;
  }

  task.name = name;
  task.forWhom = guessDisplayNameFromFields(portfolio.fields);
  task.fields = fields;
  task.docs = docs;
  task.status = status;

  const dueDateFieldValue = fields.find(f => f.name === 'Due_Date')?.value;
  task.dueDate = dueDateFieldValue ? moment(dueDateFieldValue, 'DD/MM/YYYY').toDate() : null;

  await handleTaskStatusChange(oldStatus, task);
  await repo.save(task);

  res.json();
});

interface ISearchTaskQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: TaskStatus[];
  assignee?: string;
  taskTemplateId?: string;
  portfolioId?: string;
  clientId?: string;
  dueDateRange?: [string, string];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchTaskQuery = {
  page: 1,
  size: 50,
  status: [TaskStatus.TODO, TaskStatus.TO_SIGN],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

export const searchTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField, dueDateRange, taskTemplateId, portfolioId, clientId } = option;
  const size = option.size;
  const skip = (page - 1) * size;
  const { role, id } = (req as any).user;

  let query = getManager()
    .createQueryBuilder()
    .from(Task, 'x')
  if (role === 'client') {
    query = query.andWhere(`x."userId" = :id`, { id });
  }
  if (status?.length) {
    query = query.andWhere(`x.status IN (:...status)`, { status });
  }
  if (assignee) {
    query = query.andWhere('x."agentId" = :assignee', { assignee });
  }
  if (taskTemplateId) {
    query = query.andWhere(`x."taskTemplateId" = :taskTemplateId`, { taskTemplateId });
  }
  if (portfolioId) {
    query = query.andWhere(`x."portfolioId" = :portfolioId`, { portfolioId });
  }
  if (clientId) {
    query = query.andWhere(`x."userId" = :clientId`, { clientId });
  }
  query = query.innerJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .leftJoin(q => q.from(User, 'u').select('*'), 'u', 'x."userId" = u.id')
    .leftJoin(q => q.from(Message, 'm')
      .andWhere(`"readAt" IS NULL`)
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'm', `x.id = m."taskId" AND m."clientUserId" = x."userId"`)
    .select([
      `x.id as id`,
      `x.name as name`,
      `x."forWhom" as "forWhom"`,
      `x."portfolioId" as "portfolioId"`,
      `u.email as email`,
      `x."createdAt" as "createdAt"`,
      `j.name as "taskTemplateName"`,
      `x.agentId as "agentId"`,
      `x.status as status`,
      `x."lastUpdatedAt" as "lastUpdatedAt"`,
      `m."createdAt" as "lastUnreadMessageAt"`,
      `x."dueDate" as "dueDate"`,
      // `x."signedAt" as "signedAt"`,
    ]);
  if (text) {
    query = query.andWhere('(x.name ILIKE :text OR x."forWhom" ILIKE :text OR j.name ILIKE :text OR u.email ILIKE :text)', { text: `%${text}%` });
  }
  if (dueDateRange?.length === 2) {
    query = query.andWhere(`x."dueDate" >= :start`, { start: moment(dueDateRange[0], 'DD/MM/YYYY').startOf('day').toDate() })
      .andWhere(`x."dueDate" <= :end`, { end: moment(dueDateRange[1], 'DD/MM/YYYY').endOf('day').toDate() })
  }

  const total = await query.getCount();
  const list = await query
    .orderBy(`"${orderField}"`, orderDirection)
    .offset(skip)
    .limit(size)
    .execute();

  res.json({ data: list, pagination: { page, size, total } });
});

export const listTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const clientId = (req as any).user.id;

  const query = getManager()
    .createQueryBuilder()
    .from(Task, 'j')
    .where({
      userId: clientId,
      status: Not(TaskStatus.ARCHIVE)
    })
    .leftJoin(q => q.from(Message, 'x')
      .where(`"clientUserId" = :id`, { id: clientId })
      .andWhere(`"readAt" IS NULL`)
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'x', `j.id = x."taskId"`)
    .orderBy('j."lastUpdatedAt"', 'DESC')
    .select([
      `j.id as id`,
      `j.name as name`,
      `j."forWhom" as "forWhom"`,
      `j."portfolioId" as "portfolioId"`,
      `j."createdAt" as "createdAt"`,
      `j."lastUpdatedAt" as "lastUpdatedAt"`,
      `j."agentId" as "agentId"`,
      `j.status as status`,
      `x."createdAt" as "lastUnreadMessageAt"`
    ]);

  const list = await query.execute();
  res.json(list);
});

export const getTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const repo = getRepository(Task);
  const task = await repo.findOne(id);
  assert(task, 404);

  res.json(task);
});

export const deleteTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Task);

  await repo.update(id, { status: TaskStatus.ARCHIVE });

  res.json();
});

export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;

  await getRepository(Task).update(id, { agentId });

  res.json();
});

export const signTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(id);
  assert(task, 404);
  const { files } = req.body;
  const oldStatus = task.status;

  if (files?.length) {
    const now = getNow();
    task.docs.filter(d => d.requiresSign && files.includes(d.fileId)).forEach(d => d.signedAt = now);
  }

  const unsignedFileCount = task.docs.filter(d => d.requiresSign && !d.signedAt).length;
  if (unsignedFileCount === 0) {
    task.status = TaskStatus.SIGNED;
  }

  await taskRepo.save(task);
  await handleTaskStatusChange(oldStatus, task);

  res.json();
});

async function sendTaskMessage(Task, senderId, content) {
  const user = await getRepository(User).findOne(Task.userId);
  assert(user, 404);

  const message = new Message();
  message.sender = senderId;
  message.taskId = Task.id;
  message.clientUserId = Task.userId;
  message.agentUserId = Task.agentId;
  message.content = content;

  await getRepository(Message).save(message);

  sendEmail({
    to: user.email,
    vars: {
      toWhom: getEmailRecipientName(user),
      name: Task.name
    },
    template: 'taskMessage'
  });
}

export const notifyTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { content } = req.body;
  assert(content, 404);

  const task = await getRepository(Task).findOne(id);
  assert(task, 404);

  await sendTaskMessage(task, (req as any).user.id, content);

  res.json();
});

export const listTaskNotifies = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { from, size } = req.query;
  const { user: { role, id: userId } } = req as any;
  const isClient = role === 'client';

  let query = getRepository(Message).createQueryBuilder()
    .where(`"taskId" = :id`, { id });
  if (isClient) {
    query = query.andWhere(`"clientUserId" = :userId`, { userId });
  }
  if (from) {
    query = query.andWhere(`"createdAt" >= :from`, { from: moment(`${from}`).toDate() });
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(+size || 20);

  const list = await query.getMany();

  res.json(list);
});

export const markTaskNotifyRead = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id: taskId } = req.params;
  const { user: { id: userId, role } } = req as any;
  const repo = getRepository(Message);
  const now = getNow();
  // Mark notification read
  let query;
  switch (role) {
    case 'client':
      // The messages received by this client
      query = {
        taskId,
        clientUserId: userId,
        sender: Not(userId)
      };
      break;
    case 'admin':
    case 'agent':
      const task = await getRepository(Task).findOne(taskId);
      const clientUserId = task.userId;
      query = {
        taskId,
        clientUserId,
        sender: clientUserId
      };
      break;
    default:
      assert(false, 500, 'Impossible code path');
  }

  await getRepository(Message).update(query, { readAt: now });

  res.json();
});

export const getComments = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  const list = await getRepository(TaskComment)
    .createQueryBuilder('c')
    .leftJoin(q => q.from(User, 'u'), 'u', `u.id = c."senderId"`)
    .where(`"taskId" = :id`, { id })
    .orderBy('c.id')
    .select([
      `u."givenName" as "givenName"`,
      `u."surname" as "surname"`,
      `c."senderId" as "senderId"`,
      `c.content as content`,
      `c."createdAt" as "createdAt"`,
    ])
    .execute();

  res.json(list);
});

export const newComment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { content } = req.body;
  assert(content?.trim(), 400, 'Empty comment body');
  const { user: { id: userId } } = req as any;

  const comment = new TaskComment();
  comment.taskId = id;
  comment.senderId = userId;
  comment.content = content;

  await getRepository(TaskComment).save(comment);

  res.json();
});