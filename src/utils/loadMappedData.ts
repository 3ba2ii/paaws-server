import { ClassType } from 'type-graphql';
import { BaseEntity, EntityTarget, getRepository, In } from 'typeorm';
export interface ConstructorWithId extends BaseEntity {
  id: number;
}

const mapDataToIds = <T extends ConstructorWithId>(data: T[]) => {
  let mappedData: Record<number, T> = {};
  data.forEach((d) => {
    if (d) {
      mappedData[d.id] = d;
    }
  });
  return mappedData;
};
export const loadMappedData = async <T extends ConstructorWithId>(
  entity: EntityTarget<T>,
  idList: number[]
) => {
  const repo = getRepository(entity);
  const data = await repo.findByIds(idList);

  const mappedData: Record<number, T> = mapDataToIds(data);
  return idList.map((id) => mappedData[id]);
};

export async function createOneToManyLoader<T extends Partial<ClassType>>(
  entity: EntityTarget<T>,
  ids: number[],
  keyField: string = 'id'
): Promise<T[][]> {
  const repo = getRepository(entity);
  const data = (await repo.find({
    where: {
      [keyField]: In(ids),
    },
  })) as T[];
  const map: Record<number, T[]> = {};
  //{1: []}

  //we need to map the input ids to the output data (data) and group by petId
  data.forEach((item: any) => {
    if (!map[item[keyField]]) {
      map[item[keyField]] = [];
    }
    map[item[keyField]].push(item);
  });

  return ids.map((id) => map[id]);
}
