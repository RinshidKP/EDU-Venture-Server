import Blog from "../models/blogSchema.js";

class BlogRepository {
  async createBlog(blogData) {
    try {
      const newBlog = await Blog.create(blogData);
      return newBlog;
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            throw new Error('Heading must be unique');
        }
            throw error;
    }
  }

  async findBlogsByCreatorId(creatorId) {
    try {
      const blogsByCreator = await Blog.find({ creator: creatorId });
      return blogsByCreator;
    } catch (error) {
      throw error;
    }
  }

  async updateBlog(blog) {
    try {
      const id = blog._id
        // console.log(id);
      const updatedBlog = await Blog.findOneAndUpdate(
        { _id: id },
        blog,
        { new: true } 
      );
  
      return updatedBlog;
    } catch (error) {
      throw error;
    }
  }

  async getAllBlogs(search, skipCount=0, itemsPerPage=0,sort = { createdAt: 1 }) {
    try {

      let query = {};
      if (search) {
        query.$or = [
          { heading: { $regex: new RegExp(search, 'i') } },
          { description: { $regex: new RegExp(search, 'i') } },
        ];
      }

      const blogs = await Blog.find(query)
      .populate({
        path: 'creator',
        ref: 'students'
      })
      .skip(skipCount)
      .limit(itemsPerPage)
      .sort(sort)

      const totalBlogsCount = await Blog.countDocuments();

      return { blogs, totalBlogsCount };
    } catch (error) {
      throw error;
    }
  }
  
}

export default BlogRepository;
