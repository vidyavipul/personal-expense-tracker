import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import routes from './routes';
import User from './models/User';
import Expense from './models/Expense';

let mongoServer: MongoMemoryServer;

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('Personal Expense Tracker API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }, 60000);

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'test@example.com', monthlyBudget: 5000 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/users')
        .send({ name: 'User 1', email: 'dup@example.com', monthlyBudget: 1000 });

      const res = await request(app)
        .post('/api/users')
        .send({ name: 'User 2', email: 'dup@example.com', monthlyBudget: 2000 });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const createRes = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'get@example.com', monthlyBudget: 3000 });

      const res = await request(app).get(`/api/users/${createRes.body.data._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test User');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create expense for valid user', async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({ name: 'Expense User', email: 'expense@example.com', monthlyBudget: 5000 });

      const res = await request(app)
        .post('/api/expenses')
        .send({
          title: 'Lunch',
          amount: 25,
          category: 'Food',
          userId: userRes.body.data._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Lunch');
    });

    it('should fail for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/expenses')
        .send({
          title: 'Lunch',
          amount: 25,
          category: 'Food',
          userId: fakeId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id/expenses', () => {
    it('should get expenses with pagination', async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({ name: 'Page User', email: 'page@example.com', monthlyBudget: 5000 });

      const userId = userRes.body.data._id;

      // Create 3 expenses
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/expenses')
          .send({ title: `Expense ${i}`, amount: 10, category: 'Food', userId });
      }

      const res = await request(app).get(`/api/users/${userId}/expenses?page=1&limit=2`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(3);
    });
  });

  describe('GET /api/users/:id/summary', () => {
    it('should return monthly summary', async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({ name: 'Summary User', email: 'summary@example.com', monthlyBudget: 1000 });

      const userId = userRes.body.data._id;

      await request(app)
        .post('/api/expenses')
        .send({ title: 'Groceries', amount: 100, category: 'Food', userId });

      const res = await request(app).get(`/api/users/${userId}/summary`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalExpenses).toBe(100);
      expect(res.body.data.summary.remainingBudget).toBe(900);
    });
  });
});
