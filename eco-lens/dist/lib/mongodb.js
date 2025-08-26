"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoUrl = process.env.MONGODB_URL;
async function connectToDatabase() {
    if (!mongoUrl) {
        throw new Error('MONGODB_URL env var is not set');
    }
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    return mongoose_1.default.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
    });
}
async function disconnectFromDatabase() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
}
