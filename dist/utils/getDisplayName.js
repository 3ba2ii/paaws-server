"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisplayName = void 0;
const getDisplayName = (name) => {
    if (!name)
        return '';
    const nameList = name.trim().split(' ');
    if (nameList.length === 1)
        return nameList[0];
    return `${nameList[0]} ${nameList[nameList.length - 1]}`;
};
exports.getDisplayName = getDisplayName;
//# sourceMappingURL=getDisplayName.js.map