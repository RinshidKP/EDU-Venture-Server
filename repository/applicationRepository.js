import mongoose from "mongoose";
import ApplicationModel from "../models/applicationSchema.js";
import Country from "../models/countriesSchema.js";
import StudentModel from "../models/studentSchema.js";

class ApplicationRepository {
  // Create a new application
  async createApplication(studentId, courseId, status = 'Pending', additionalNotes = '') {
    try {
      const application = new ApplicationModel({
        student: studentId,
        course: courseId,
        status,
        additionalNotes,
      });
      const savedApplication = await application.save();
      return savedApplication;
    } catch (error) {
      throw error;
    }
  }

  // Get a single application by ID
  async getApplicationById(applicationId) {
    try {
      const application = await ApplicationModel.findById(applicationId)
      .populate('course')
      .populate({
        path: 'student',
        model:StudentModel,
      });
      return application;
    } catch (error) {
      throw error;
    }
  }

  // Update an application by ID
  async updateApplication(applicationId, updateFields) {
    try {
      console.log(applicationId,updateFields);
      const updatedApplication = await ApplicationModel.findByIdAndUpdate(
        applicationId,
        { $set: updateFields },
        { new: true }
      );
      return updatedApplication;
    } catch (error) {
      throw error;
    }
  }

  // Delete an application by ID
  async deleteApplication(applicationId) {
    try {
      const deletedApplication = await ApplicationModel.findByIdAndRemove(applicationId);
      return deletedApplication;
    } catch (error) {
      throw error;
    }
  }

  async getApplicationsByStudent(studentId) {
    try {
      const applications = await ApplicationModel.find({ student: studentId })
      .populate({
        path: 'course',
        populate: {
          path: 'country',
          model: Country,
        },
      });
      return applications;
    } catch (error) {
      throw error;
    }
  }

  // Get all applications for a specific course
  async getApplicationsByCourse(courseId) {
    try {
      const applications = await ApplicationModel.find({ course: courseId });
      return applications;
    } catch (error) {
      throw error;
    }
  }

  async findApplicationsByCourseCreator(creatorId,skip,limit,search,sortDateCriteria,status,paymentStatus) {
    try {

      const matchCondition = {
        'course.creator_id': creatorId,
      };
      if(status){
        matchCondition.status = status
      }
      if(paymentStatus){
        matchCondition.paymentStatus=paymentStatus
      }
      if (search) {
        matchCondition['$or'] = [
          { 'course.header': { $regex: search, $options: 'i' } },
          { 'student.full_name': { $regex: search, $options: 'i' } },
        ];
      }

      const sortCriteria = {
        'applicationDate': parseInt(sortDateCriteria),
      }
      const applicationsPipeline = [
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
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'student',
          },
        },
        {
          $match: matchCondition
        },
        {
        $unwind: '$student',
        },
        {
          $sort: sortCriteria
      },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ];

      const countPipeline = [
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
          $match: matchCondition
        },
        {
          $count: 'count',
        },
      ];
      
      const [applications, countResult] = await Promise.all([
        ApplicationModel.aggregate(applicationsPipeline),
        ApplicationModel.aggregate(countPipeline),
      ]);
  
      const totalApplicationsCount = countResult.length > 0 ? countResult[0].count : 0;
  
      return { applications, totalApplicationsCount };
    } catch (error) {
      throw error;
    }
  }

  async findIfStudentApplied (studentId, courseId) {
    try {
      const result = await ApplicationModel.find({
        student: studentId,
        course: courseId,
      });
      
      if (result.length > 0) {
        return result;
      } else {
        return false;
      }
      
    } catch (error) {
      console.error('Error finding application:', error);
    }
  };
  
  
  async getApplicationCountByCreatorId(creatorId) {
    try {
      const applicationCount = await ApplicationModel.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $match: {
            'course.creator_id': new mongoose.mongo.ObjectId(creatorId),
          },
        },
        {
          $count: 'applicationCount',
        },
      ]);
  
      return applicationCount.length > 0 ? applicationCount[0].applicationCount : 0;
    } catch (error) {
      console.error('Error in getApplicationCountByCreatorId:', error);
      throw error;
    }
  }
  async getAcceptedStudentsCountByCreatorId(creatorId) {
    try {
      const acceptedStudentsCount = await ApplicationModel.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $match: {
            'course.creator_id': new mongoose.mongo.ObjectId(creatorId),
            status: 'Accepted',
          },
        },
        {
          $count: 'acceptedStudentsCount',
        },
      ]);
  
      return acceptedStudentsCount.length > 0 ? acceptedStudentsCount[0].acceptedStudentsCount : 0;
    } catch (error) {
      console.error('Error in getAcceptedStudentsCountByCreatorId:', error);
      throw error;
    }
  }
  
  async getAllPendingApplicationsByCreatorId(creatorId) {
    try {
      const pendingApplications = await ApplicationModel.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'student',
          },
        },
        {
          $match: {
            'course.creator_id': new mongoose.mongo.ObjectId(creatorId),
            status: 'Pending',
          },
        },
        {
          $project: {
            course: {
              $arrayElemAt: ['$course', 0], // Extract the first element of the 'course' array
            },
            student: {
              $arrayElemAt: ['$student', 0], // Extract the first element of the 'student' array
            },
            status: 1,
            additionalNotes: 1,
          },
        },
      ]);
  
      return pendingApplications;
    } catch (error) {
      console.error('Error in getAllPendingApplicationsByCreatorId:', error);
      throw error;
    }
  }
  
  
  
  
}

export default ApplicationRepository;
