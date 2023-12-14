import mongoose from "mongoose";
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
      .populate('payer')
      .exec();
      return transactions;
    } catch (error) {
      throw new Error(`Error getting transactions by student ID: ${error.message}`);
    }
  }

  async getTotalFeeForCourseCreator(creatorId) {
    try {
      const result = await Transaction.aggregate([
        {
          $match: {
            isSuccess: true,
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: '$course',
        },
        {
          $match: {
            'course.creator_id':  new mongoose.mongo.ObjectId(creatorId),
          },
        },
        {
          $group: {
            _id: null,
            totalFee: { $sum: '$course.fee' },
          },
        },
      ]);

      if (result.length > 0) {
        return result[0].totalFee;
      } else {
        return 0;
      }
    } catch (error) {
      throw error;
    }
  }
  
  
}

export default TransactionRepository;
