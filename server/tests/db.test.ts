import { connectToDatabase, disconnectFromDatabase } from '../src/lib/mongodb';

describe('MongoDB connectivity', () => {
  it('connects and disconnects successfully', async () => {
    const conn = await connectToDatabase();
    expect(conn.connection.readyState).toBe(1);
    await disconnectFromDatabase();
  }, 20000);
});


