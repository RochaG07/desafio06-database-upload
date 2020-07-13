import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import path from 'path';

import Transactions from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import multer from 'multer';

const tempFolder = path.resolve(__dirname, '..', '..', 'tmp');
const upload = multer({ dest: tempFolder });


const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  return response.json({transactions, balance});
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });
  
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).json();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {

  const importTransactionsService = new ImportTransactionsService();

  const filePath = tempFolder +'/'+ request.file.filename;

  const transactions = await importTransactionsService.execute(filePath);

  return response.json(transactions); 
});

export default transactionsRouter;