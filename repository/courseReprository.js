import CourseModel from '../models/courseModel.js'
import Country from '../models/countriesSchema.js';
class CourseRepository {

   async createCourse(courseData) {
    try {
      const course = await CourseModel.create(courseData);
      return course;
    } catch (error) {
      throw error;
    }
  }

  async  getCourseAllCourses(limit) {
    try {
      const pipeline = [
        {
          $match: {
            is_active: true,
            approved: true,
          },
        },
        {
          $sort: {
            created: -1,
          },
        },
      ];

      if (limit) {
        pipeline.push({
          $limit: limit,
        });
      }
  
      const result = await CourseModel.aggregate(pipeline);
  
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  

   async getCourseById(courseId) {
    try {
      const course = await CourseModel.findById(courseId);
      return course;
    } catch (error) {
      throw error;
    }
  }

   async updateCourse(courseId, updatedData) {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, updatedData, {
        new: true,
      });
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

   async deleteCourse(courseId) {
    try {
      const result = await CourseModel.findByIdAndDelete(courseId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findCoursesByCreator(creatorId, limit = 6, sortCriteria = { createdAt: -1 }) {
    try {
      let query = CourseModel.find({ creator_id: creatorId })
      .populate({
        path: 'country',
        model: Country,
      });
  
      if (limit > 0) {
        query = query.limit(limit);
      }
  
      if (sortCriteria) {
        query = query.sort(sortCriteria);
      }
  
      const courses = await query.exec();
      return courses;
    } catch (error) {
      throw error;
    }
  }
  

  async getCoursesByPage(skip, limit, sortCriteria = { createdAt: -1 }) {
    try {
      const aggregationPipeline = [
        {
          $match: {
            is_active: true,
            approved: true,
          },
        },
        {
          $facet: {
            courses: [
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
              {
                $sort: sortCriteria,
              },
            ],
            totalCourseCount: [
              {
                $count: 'count',
              },
            ],
          },
        },
      ];
  
      const result = await CourseModel.aggregate(aggregationPipeline).exec();
      const courses = result[0].courses;
      const totalCoursesCount = result[0].totalCourseCount[0]?.count || 0;

      return { courses, totalCoursesCount };
    } catch (error) {
      throw error;
    }
  }
  
  
  
  async getTotalCourseCount() {
    try {
      const count = await CourseModel.countDocuments(); 
  
      return count;
    } catch (error) {
      throw error;
    }
  }  

  async getCoursesByCountry(countryID) {
    try {
      const courses = await CourseModel.find({country:countryID})

      return courses;
    } catch (error) {
      
    }
  }

}


export default CourseRepository;
