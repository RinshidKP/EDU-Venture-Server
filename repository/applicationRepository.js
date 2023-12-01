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

  async findApplicationsByCourseCreator(creatorId) {
    try {
      const applications = await ApplicationModel.aggregate([
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
            'course.creator_id': creatorId,
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
        $unwind: '$student',
        },
      ]);
      return applications;
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
