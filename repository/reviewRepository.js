import Review from "../models/reviewSchema.js";

class ReviewRepository {
   async createReview(reviewData) {
    try {
      const newReview = await Review.create(reviewData);
      return await newReview.populate('student_id');
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }
  async findCourseReviews(courseId) {
    try {
      const reviews = await Review.find({ course_id: courseId })
        .limit(5)
        .sort({ createdAt: -1 })
        .populate('student_id');
      return reviews ? reviews : false ;
    } catch (error) {
      throw new Error(`Error finding review by course id: ${error.message}`);
    }
  }
    //not used
   async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      return review;
    } catch (error) {
      throw new Error(`Error getting review by ID: ${error.message}`);
    }
  }
   async updateReview(reviewId, updateData) {
    try {
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true , populate: 'student_id' }
      );
      
      return updatedReview;
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

   async deleteReview(reviewId) {
    try {
      const deletedReview = await Review.findByIdAndDelete(reviewId);
      return deletedReview;
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

   async getAllReviews() {
    try {
      const reviews = await Review.find();
      return reviews;
    } catch (error) {
      throw new Error(`Error getting all reviews: ${error.message}`);
    }
  }
}

export default ReviewRepository;
