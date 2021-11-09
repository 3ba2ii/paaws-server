"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageMetaData = void 0;
const path_1 = __importDefault(require("path"));
const generateRandomString_1 = require("./generateRandomString");
function createImageMetaData(filename) {
    const randomName = (0, generateRandomString_1.generateRandomString)(12);
    const uniqueFileName = `${randomName}-${new Date().toISOString()}-${filename}`;
    const pathName = path_1.default.join(__dirname, '../', `public/images/${uniqueFileName}`);
    return { pathName, uniqueFileName };
}
exports.createImageMetaData = createImageMetaData;
//# sourceMappingURL=createImage.js.map