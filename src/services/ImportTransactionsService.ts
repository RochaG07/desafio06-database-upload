import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import CreateTransactionService from './CreateTransactionService';

interface RequestTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

async function loadCSV(filepath: string): Promise<any[]>{

  const readCSVSStream = fs.createReadStream(filepath);

  const parseStream = csvParse({
    from_line: 1,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVSStream.pipe(parseStream);

  const lines: string[] = []; 


  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService { 
  async execute(filename: string): Promise<Transaction[]> {

    const transactions: Transaction[] = [];

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    const data = await loadCSV(csvFilePath);


    const transactionCSV: RequestTransactionDTO[] = data.map(item => {
      return {
        title: item[0],
        type:
          item[1] === 'income' || item[1] === 'outcome' ? item[1]:'income',
        value: Number(item[2]),
        category: item[3]
      }
    });

    const createTransactionService = new CreateTransactionService();
    for (let index = 0; index < transactionCSV.length; index++) {
      transactions.push(await createTransactionService.execute(transactionCSV[index]));
    }
    
    return transactions;
  }
}

export default ImportTransactionsService;
