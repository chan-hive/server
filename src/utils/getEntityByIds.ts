import * as _ from "lodash";
import { Repository } from "typeorm";

export async function getEntityByIds<T extends { id: string | number }>(
    repository: Repository<T>,
    ids: Array<string | number>,
): Promise<T[]> {
    const entities = await repository.findByIds(ids);
    const entityMap = _.chain(entities)
        .keyBy(e => e.id)
        .mapValues()
        .value();

    return ids.map(id => entityMap[id]);
}
