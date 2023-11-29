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
    async listStudentsForAdmin(search, skipCount = 0, itemsPerPage = 0, sort = { createdAt: 1 }) {
      try {
        let query = { isAdmin: false };
        if (search) {
          query.$or = [
            { full_name: { $regex: new RegExp(search, 'i') } },
            { email: { $regex: new RegExp(search, 'i') } },
          ];
        }
        const students = await StudentModel.find(query)
          .skip(skipCount)
          .limit(itemsPerPage)
          .sort(sort);
          const totalStudentsCount = await StudentModel.countDocuments({ isAdmin: false });
        return { students, totalStudentsCount };
      } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
    }
    async findArrayOfStudents(objectIds) {
      try {
        const students = await StudentModel.find({ _id: { $in: objectIds } });
        return students;
      } catch (error) {
        console.error('Error in findArrayOfStudents:', error);
        throw error;
      }
    }

    async updateStudentAccessById(studentId) {
      try {
        let student = await StudentModel.findById(studentId);
    
        if (student) {
          student.isActive = !student.isActive;
          await student.save();
          return student;
        } else {
          throw new Error('Student not found');
        }
      } catch (error) {
        throw error;
      }
    }

    async findStudentWithId(id) {
      try {
        const student = await StudentModel.findById(id);
        if (student) {
          return student
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    async totalStudentsCount(){
      try {
        return await StudentModel.countDocuments({isAdmin:false})
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
}


export default StudentRepository;
