"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("./lib/mongodb");
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', async (_req, res) => {
    try {
        await (0, mongodb_1.connectToDatabase)();
        res.status(200).json({
            status: 'ok',
            message: 'Server is running and database is connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// User routes
app.use('/api/users', users_1.default);
// Test endpoint to check database connection
app.get('/api/test-db', async (_req, res) => {
    try {
        const mongoose = await (0, mongodb_1.connectToDatabase)();
        res.status(200).json({
            success: true,
            message: 'Database connection successful',
            connectionState: mongoose.connection.readyState,
            database: mongoose.connection.name,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
        console.log(`🔗 Database test: http://localhost:${port}/api/test-db`);
        console.log(`👥 User API: http://localhost:${port}/api/users`);
    });
}
exports.default = app;
