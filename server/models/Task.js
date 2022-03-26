import objectionUnique from 'objection-unique';

import BaseModel from './BaseModel.js';

const unique = objectionUnique({ fields: ['email'] });

export default class Task extends unique(BaseModel) {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: {
          type: 'integer',
          minimum: 1,
        },
        creatorId: {
          type: 'integer',
          minimum: 1,
        },
        executorId: {
          type: ['integer', 'null'],
          minimum: 1,
        },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    // One way to prevent circular references
    // is to require the model classes here.
    return {
      status: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'TaskStatus',

        join: {
          from: 'task.statusId',
          to: 'task_statuses.id',
        },
      },

      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'User',

        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },

      executor: {
        relation: BaseModel.BelongsToOneRelation,
        midelClass: 'User',

        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
    };
  }
}
