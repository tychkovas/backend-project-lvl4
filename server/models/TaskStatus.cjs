// import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel.cjs';

const unique = objectionUnique({
  fields: ['name'],
});

export default class TaskStatus extends unique(BaseModel) {
  static get tableName() {
    return 'task_statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task',

        join: {
          from: 'task_statuses.id',
          to: 'tasks.statusId',
        },
      },
    };
  }
}