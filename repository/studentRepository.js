import StudentModel from '../models/studentSchema.js';

class StudentRepository {
  async createStudentUser(studentData) {
    try {
      const newUser = await StudentModel.create(studentData);
      return newUser;
    } catch (error) {
        console.error(error);
      throw new Error('Failed to create a student user');
    }
  }

  async getUserByEmail(studentEmail) {
    try {
      const user = await StudentModel.findOne({ email: studentEmail });
      return user;
    } catch (error) {
      throw new Error('Failed to get user by email');
    }
  }

  async updateUserField(studentEmail, fieldName, newValue) {
    try {
      const user = await StudentModel.findOneAndUpdate(
        { email: studentEmail },{ [fieldName]: newValue },
        { new: true });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update user field');
    }
  }

  async updateStudentInfoByObject(email, obj) {
    try {
      const updatedConsultant = await StudentModel.findOneAndUpdate({email: email}, obj, { new: true });
      return updatedConsultant;
    } catch (error) {
      throw error;
    }
  }

  async findStudentInfoByEmail(email) {
    try {

      const studentDetails = await StudentModel.findOne({ email: email });
      
      if (studentDetails) {
        return studentDetails;
      } else {
        throw new Error('Student not found');
      }

    } catch (error) {
      throw error;
    }
  }

  async doesCourseExistForStudent(studentEmail, courseIdToFind) {

    const aggregationPipeline = [
      {
        $match: { email: studentEmail },
      },
      {
        $project: {
          _id: 0,
          courseExists: {
            $in: [mongoose.Types.ObjectId(courseIdToFind), '$courses'],
          },
        },
      },
    ];
  
    try {
      const result = await StudentModel.aggregate(aggregationPipeline).exec();
  
      if (result.length === 0) {
        
        return false;
      }
  
      return result[0].courseExists;
    } catch (error) {
      throw error;
    }
  }

  async addCourseToStudent(studentEmail, courseIdToAdd) {
    try {
      
      const result = await StudentModel.updateOne({ email: studentEmail },  { $push: { courses: courseIdToAdd } });
  
      if (result.nModified > 0) {
        
        return true; 
      }
  
      return false; 
    } catch (error) {
      throw error;
    }
  }
  
  async findStudentsWithCoursesCreatedByConsultant(consultantId) {
    try {
      
      const students = await StudentModel.aggregate([
        {
          $lookup: {
            from: 'courses', 
            localField: 'courses',
            foreignField: '_id',
            as: 'student_courses',
          },
        },
        {
          $match: {
            'student_courses.creator_id': consultantId,
          },
        },
      ]);
      return students;
    } catch (error) {
      throw new Error('Failed to find students with courses created by consultant');
    }
    }
    async listStudentsForAdmin() {
      try {
        const students = await StudentModel.find({ isAdmin: false });
        return students; 
      } catch (error) {
        console.error("Error fetching students:", error);
        throw error; 
      }
    }
}


export default StudentRepository;
