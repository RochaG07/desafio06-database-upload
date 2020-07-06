import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {
    let incomeValue = 0, outcomeValue = 0;

    const transactions = await this.find()
    
    transactions.forEach(transaction => {
      if(transaction.type == 'income'){
        incomeValue += transaction.value;
      } else if(transaction.type == 'outcome'){
        outcomeValue += transaction.value;
      }
    });

    const total = incomeValue - outcomeValue;

    const balance = {
      income: incomeValue,
      outcome: outcomeValue,
      total
    }

    return balance;
  }
}

export default TransactionsRepository;
