import CourseModel from '../models/courseModel.js'
import Country from '../models/countriesSchema.js';
import mongoose, { Types } from 'mongoose';

const { ObjectId } = Types;
class CourseRepository {

   async createCourse(courseData) {
    try {
      const course = await CourseModel.create(courseData);
      return course;
    } catch (error) {
      throw error;
    }
  }

  async getCourseAllCourses(limit) {
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
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            as: 'countryInfo',
          },
        },
        {
          $unwind: {
            path: '$countryInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'consultancies',
            localField: 'creator_id',
            foreignField: '_id',
            as: 'creator',
          },
        },
        {
          $unwind: {
            path: '$creator',
            preserveNullAndEmptyArrays: true,
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
        
        const courses = await CourseModel
            .find({
                creator_id: creatorId,
                is_active: true,
                approved: true,
            })
            .sort(sortCriteria)
            .limit(limit)
            .populate({
                path: 'creator_id',
                model: 'Consultancy',
            })
            .populate({
                path: 'country',
                model: 'Country',
            })
            .exec();

        return courses;
    } catch (error) {
        throw error;
    }
}

  
  
  

  async getCoursesByPage(skip, limit ,filterCountries ,search, sortCriteria = { createdAt: -1 }) {
    try {

      const matchStage = {
        is_active: true,
        approved: true,
      };

      if (search && search.trim()) {
        matchStage.header = { $regex: new RegExp(search.trim(), 'i') };
      }      
  
      if (filterCountries.length > 0) {
        matchStage.country = { $in: filterCountries.map(id => new ObjectId(id)) }
      }  

      const aggregationPipeline = [
        {
          $match: matchStage,
        },
        {
          $facet: {
            courses: [
              {
                $lookup: {
                  from: 'consultancies',
                  localField: 'creator_id',
                  foreignField: '_id',
                  as: 'creator',
                },
              },
              {
                $unwind: {
                  path: '$creator',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: 'countries', 
                  localField: 'country',
                  foreignField: '_id',
                  as: 'countryInfo',
                },
              },
              {
                $unwind: {
                  path: '$countryInfo',
                  preserveNullAndEmptyArrays: true,
                },
              },
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
      .populate({
        path: 'creator_id',
        model: 'Consultancy',
      })
      .populate({
          path: 'country',
          model: 'Country',
      })
      .exec();

      return courses;
    } catch (error) {
      
    }
  }

  async getCourseCountByCreator(consultentIds){
    try {
      const coursesCountByConsultant = await CourseModel.aggregate([
        {
          $match: {
            creator_id: { $in: consultentIds },
          },
        },
        {
          $group: {
            _id: '$creator_id',
            count: { $sum: 1 },
          },
        },
      ]);
      return coursesCountByConsultant ;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get course counts by consultant');
    }
  }

  async getCourseCountByConsultantId(consultantId) {
    try {
      const coursesCountByConsultant = await CourseModel.aggregate([
        {
          $match: {
            creator_id: consultantId,
          },
        },
        {
          $count: 'count',
        },
      ]);
  
      const count = coursesCountByConsultant.length > 0 ? coursesCountByConsultant[0].count : 0;
  
      return count;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get course count by consultant ID');
    }
  }  

  async totalCourseCount(){
    try {
      return await CourseModel.countDocuments()
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getCoursesWithApplicationCountByCreatorId(creatorId) {
    try {
      const coursesWithApplicationCount = await CourseModel.aggregate([
        {
          $match: {
            creator_id: new mongoose.mongo.ObjectId(creatorId),
          },
        },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'course',
            as: 'applications',
          },
        },
        {
          $addFields: {
            applicationCount: { $size: '$applications' },
          },
        },
      ]);
  
      return coursesWithApplicationCount;
    } catch (error) {
      console.error('Error in getCoursesWithApplicationCountByCreatorId:', error);
      throw error;
    }
  }
}


export default CourseRepository;
