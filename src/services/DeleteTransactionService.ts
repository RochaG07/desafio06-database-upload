import AppError from '../errors/AppError';
import { getCustomRepository, IsNull } from 'typeorm';
import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';


class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const transactions = await transactionsRepository.find();

    let transactionExists = false;
    transactions.forEach(transaction => {
      if (transaction.id === id ){
        transactionExists = true;
      }
    });

    if( !transactionExists ){
      throw new AppError('id not found');
    }

    await transactionsRepository.delete({id: id});

  }
}

export default DeleteTransactionService;
