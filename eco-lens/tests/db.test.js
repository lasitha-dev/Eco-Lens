"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("../src/lib/mongodb");
describe('MongoDB connectivity', () => {
    it('connects and disconnects successfully', async () => {
        const conn = await (0, mongodb_1.connectToDatabase)();
        expect(conn.connection.readyState).toBe(1);
        await (0, mongodb_1.disconnectFromDatabase)();
    }, 20000);
});
