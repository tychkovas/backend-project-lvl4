import { Model } from 'objection';

export default class BaseModel extends Model {
  static get modelPath() {
    return [__dirname];
  }
}
