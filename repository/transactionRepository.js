import Transaction from "../models/transactionSchema.js"; 

class TransactionRepository {
  async createTransaction(transactionData) {
    try {
      const transaction = await Transaction.create(transactionData);
      return transaction;
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        // .populate('payer receiver course application')
        .exec();
        return transaction;
    } catch (error) {
        throw new Error(`Error getting transaction by ID: ${error.message}`);
    }
}

async getTransactionByApplicationId(applicationId) {
    try {
        const transactions = await Transaction.find({ application: applicationId })
        .exec();
      return transactions;
    } catch (error) {
      throw new Error(`Error getting transactions by application ID: ${error.message}`);
    }
  }

  async getTransactionByStudentId(studentId) {
    try {
      const transactions = await Transaction.find({ payer : studentId })
      .populate('application')
      .populate('course')
      .exec();
      return transactions;
    } catch (error) {
      throw new Error(`Error getting transactions by student ID: ${error.message}`);
    }
  }
}

export default TransactionRepository;
