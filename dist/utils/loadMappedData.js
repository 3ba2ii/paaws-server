"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOneToManyLoader = exports.loadMappedData = void 0;
const typeorm_1 = require("typeorm");
const mapDataToIds = (data) => {
    let mappedData = {};
    data.forEach((d) => {
        if (d) {
            mappedData[d.id] = d;
        }
    });
    return mappedData;
};
const loadMappedData = async (entity, idList) => {
    const repo = (0, typeorm_1.getRepository)(entity);
    const data = await repo.findByIds(idList);
    const mappedData = mapDataToIds(data);
    return idList.map((id) => mappedData[id]);
};
exports.loadMappedData = loadMappedData;
async function createOneToManyLoader(entity, ids, keyField = 'id') {
    const repo = (0, typeorm_1.getRepository)(entity);
    const data = (await repo.find({
        where: {
            [keyField]: (0, typeorm_1.In)(ids),
        },
    }));
    const map = {};
    data.forEach((item) => {
        if (!map[item[keyField]]) {
            map[item[keyField]] = [];
        }
        map[item[keyField]].push(item);
    });
    return ids.map((id) => map[id]);
}
exports.createOneToManyLoader = createOneToManyLoader;
//# sourceMappingURL=loadMappedData.js.map