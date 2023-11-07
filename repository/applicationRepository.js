import ApplicationModel from "../models/applicationSchema.js";
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

  // Get all applications for a specific student
  async getApplicationsByStudent(studentId) {
    try {
      const applications = await ApplicationModel.find({ student: studentId });
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
}

export default ApplicationRepository;
