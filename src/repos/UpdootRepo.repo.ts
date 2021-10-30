import { Service } from 'typedi';
import {
  Connection,
  EntityRepository,
  EntityTarget,
  getConnection,
  Repository,
} from 'typeorm';
import { Comment } from '../entity/InteractionsEntities/Comment';
import { Updoot } from '../entity/InteractionsEntities/Updoot';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import { INTERNAL_SERVER_ERROR } from './../errors';
import { VotingResponse } from './../types/responseTypes';

interface UpdateUpdootProps {
  updoot: Updoot;
  entity: MissingPost | Comment;
  value: number;
}
interface CreateUpdootProps<T extends MissingPost | Comment> {
  updootTarget: EntityTarget<Updoot>;
  entity: T;
  user: User;
  value: number;
  type: 'post' | 'comment';
}

@Service()
@EntityRepository(Updoot)
export class UpdootRepo extends Repository<Updoot> {
  private conn: Connection = getConnection();

  private async saveUpdoot(updoot: Updoot, entity: MissingPost | Comment) {
    const success = await this.conn
      .transaction(async (_) => {
        await updoot.save();
        await entity.save();
      })
      .then(() => true)
      .catch(() => false);
    return success;
  }
  private getLastChangeTimeDiff(updoot: Updoot) {
    const lastUpdooted = updoot.updatedAt;
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdooted.getTime();
    const diffInMinutes = Math.ceil(timeDiff / (1000 * 60));
    return diffInMinutes;
  }

  public async updateUpdootValue({
    updoot,
    entity,
    value,
  }: UpdateUpdootProps): Promise<VotingResponse> {
    //1. check if the user has changed his updoot so many times in the last 5 minutes (to prevent spam)
    const diffInMinutes = this.getLastChangeTimeDiff(updoot);
    if (diffInMinutes <= 10 && updoot.changes > 5) {
      //user has changed his vote more than 5 times in 10 minutes (SPAM)
      console.log('❌ SPAM');
      return {
        success: false,
        errors: [
          {
            code: 400,
            message:
              'You have changed your vote more than 5 times in the last 10 minutes. Please stop spamming',
            field: 'spam',
          },
        ],
      };
    }
    //if the user has already updooted the comment and now wants to change the value
    updoot.value = value;
    entity.points += 2 * value;
    updoot.changes += 1;

    const success = await this.saveUpdoot(updoot, entity);
    if (success) return { success: true };
    return { success: false, errors: [INTERNAL_SERVER_ERROR] };
  }

  public async createUpdoot<T extends MissingPost | Comment>({
    updootTarget,
    entity,
    user,
    value,
    type,
  }: CreateUpdootProps<T>): Promise<VotingResponse> {
    const repo = this.conn.getRepository(updootTarget);
    const newUpdoot = repo.create({
      [type]: entity,
      user,
      value,
    });
    entity.points += value;
    const success = await this.saveUpdoot(newUpdoot, entity);
    if (success) return { success: true };
    return { success: false, errors: [INTERNAL_SERVER_ERROR] };
  }
}
