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
    return `${this.firstName} - ${this.lastName}`;
    // return this.firstName + ' ' + this.lastName;
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
  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
}
