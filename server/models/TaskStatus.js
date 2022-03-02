import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({
  fields: ['name'],
});

export default class TaskStatus extends unique(Model) {
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
}
