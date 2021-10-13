import { BaseEntity, EntityTarget, getRepository } from 'typeorm';
interface ConstructorWithId extends BaseEntity {
  id: number;
}

export const loadMappedData = async <T extends ConstructorWithId>(
  entity: EntityTarget<T>,
  idList: number[]
) => {
  const repo = getRepository(entity);
  const data = await repo.findByIds(idList);

  let mappedData: Record<number, T> = {};
  data.forEach((d) => {
    if (d) {
      mappedData[d.id] = d;
    }
  });
  return idList.map((id) => mappedData[id]);
};
