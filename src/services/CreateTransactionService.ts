import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request{
  title: string,
  value: number,
  type: 'income' | 'outcome';
  category: string,
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    //Regras de negócio
    if(type != 'income' && type != 'outcome'){
      throw new AppError('invalid transaction type.', 401);
    }

    // should not be able to create outcome transaction without a valid balance
    if(type == 'outcome'){
      const balance = await transactionRepository.getBalance();

      if(balance.total < value){
        throw new AppError('should not be able to create outcome transaction without a valid balance');
      }
    }

    //Cria uma nova categoria se não existir
    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({where: {title: category}});

    //Transforma category em category_id
    let category_id;
    if(categoryExists){
      category_id = categoryExists.id;
    } else {
      //Cria uma nova categoria caso não exista no banco
      const createdCategory = categoryRepository.create({
        title: category
      });

      await categoryRepository.save(createdCategory);

      category_id = createdCategory.id;
    }



    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
