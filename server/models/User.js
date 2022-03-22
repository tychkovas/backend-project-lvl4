// @ts-check

// import { Model } from 'objection';
// @ts-ignore
import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel.js';

import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(BaseModel) {
  // @ts-ignore
  static get tableName() {
    return 'users';
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // @ts-ignore
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
      },
    };
  }

  // @ts-ignore
  static get relationMappings() {
    return {
      createdTasks: {
        relation: BaseModel.HasManyRelation,
        model: 'Task',

        join: {
          from: 'tasks.id',
          to: 'users.id',
        },
      },
      assignedTasks: {
        relation: BaseModel.BelongsToOneRelation,
        model: 'Task',

        join: {
          from: 'tasks.id',
          to: 'users.id',
        },
      },
    };
  }

  // @ts-ignore
  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  // @ts-ignore
  get name() {
    return this.fullName();
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
}
