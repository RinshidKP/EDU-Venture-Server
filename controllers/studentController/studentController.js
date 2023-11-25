import { compareSecret, secretHash } from '../../helper/secretHash.js'
import StudentRepository from '../../repository/studentRepository.js';
import OtpRepository from '../../repository/otpReprository.js';
import CourseRepository from '../../repository/courseReprository.js';
import ConsultancyRepository from '../../repository/consultentReprository.js';
import sendMail from '../../helper/sendMail.js';
import { generateToken } from '../../middleware/auth.js';
import ApplicationRepository from '../../repository/applicationRepository.js';
import CountriesRepository from '../../repository/countriesRepository.js';
import messageRepository from '../../repository/chatRepository.js';
import BlogRepository from '../../repository/blogRepository.js';
import imageCloudUpload from '../../helper/couldUpload.js';


const StudentDB = new StudentRepository();
const OneTimePassword = new OtpRepository();
const courseDB = new CourseRepository();
const counsultentDB = new ConsultancyRepository();
const applicationDB = new ApplicationRepository();
const countryDB = new CountriesRepository();
const blogDB = new BlogRepository();

export const createStudent = async (req, res, next) => {
  try {
    const studentData = req.body;

    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(studentData.email)) {
      console.error('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const [existingUser, existingOtp] = await Promise.all([
      StudentDB.getUserByEmail(studentData.email),
      OneTimePassword.findOtpByEmail(studentData.email),
    ]);

    if (existingUser) {
      console.error("User Exists");
      res.json({ error: 'Email Already Exists' })
      return
    }

    if (existingOtp) {
      await OneTimePassword.deleteOtpByEmail(studentData.email)
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await OneTimePassword.createOtp(studentData.email, otp);

    studentData.password = await secretHash(studentData.password);

    const newUser = await StudentDB.createStudentUser(studentData);
    sendMail(newUser.email, otp);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    next(error)
  }
}

export const validateOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Invalid Data' });
    }

    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(email)) {
      console.error('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const [user, storedOtp] = await Promise.all([
      StudentDB.getUserByEmail(email),
      OneTimePassword.findOtpByEmail(email),
    ]);

    if (!user) {
      console.error('no user');
      return res.status(404).json({ error: 'User not found' });
    }

    if (!storedOtp) {
      console.error('no stored otp');
      return res.status(400).json({ error: 'OTP not found. Please try again' });
    }

    if (storedOtp.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return
    }

    const currentDate = Date.now();

    if (currentDate > storedOtp.expirationDate) {
      return res.status(401).json({ error: 'The OTP has expired' });
    }
    await Promise.all([
      StudentDB.updateUserField(email, 'isVerified', true),
      OneTimePassword.deleteOtpByEmail(email)
    ]);
    const jwtToken = generateToken(user, 'student');
    res.status(200).json({ message: 'OTP validated successfully', token: jwtToken, user, role: 'student' });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resend_otp = async (req, res, next) => {
  try {
    const { email } = req.query;
    const [user, deleted] = await Promise.all([
      StudentDB.getUserByEmail(email),
      OneTimePassword.deleteOtpByEmail(email)
    ]);
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(email)) {
      console.error('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'The User is Already Verified' });
    }
    const new_otp = Math.floor(1000 + Math.random() * 9000);

    await OneTimePassword.createOtp(user.email, new_otp);

    sendMail(user.email, new_otp);
    res.status(200).json({ message: 'OTP Resent Successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export const handleSignin = async (req, res, next) => {
  try {
    const userData = req.body;
    if (!userData.password || !userData.email) {
      console.error('Invalid Data');
      return res.status(400).json({ error: 'Invalid Data' });
    }
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(userData.email)) {
      console.error('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }
    const user = await StudentDB.getUserByEmail(userData.email);

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      console.error('User not verified');
      return res.status(401).json({ message: 'User not verified' });
    }

    const passMatch = await compareSecret(userData.password, user.password);
    if (passMatch) {

      if (user.isAdmin) {
        const jwtToken = generateToken(user, 'admin');
        return res.status(200).json({ message: 'User signed in successfully', token: jwtToken, user, role: 'admin' });
      }
      const jwtToken = generateToken(user, 'student');
      return res.status(200).json({ message: 'User signed in successfully', token: jwtToken, user, role: 'student' });
    } else {
      console.error('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(error);
  }
};

export const loadProfile = async (req, res, next) => {
  try {
    const email = req.user.email;
    const user = await StudentDB.getUserByEmail(email);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: "User not found" });
    }

  } catch (error) {
    console.error("Error loading user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const studentData = req.body;
    if (req.file) {
      // studentData.profile_picture = req.file.filename
      studentData.profile_picture = await imageCloudUpload(req.file)
    }
    const email = req.user.email

    const user = await StudentDB.updateStudentInfoByObject(email, studentData);
    res.status(200).json({ user, message: 'Profile Updated Successfully' })
  } catch (error) {
    console.error("Error while updating consultent profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const list_courses = async (req, res) => {
  try {
    const limit = 6
    const courses = await courseDB.getCourseAllCourses(limit);
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error while listing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const list_courses_by_creator = async (req, res) => {
  try {

    const id = req.query.id
    const limit = id ? 0 : 6;
    const sortCriteria = { createdAt: -1 };
    const courses = await courseDB.findCoursesByCreator(id, limit, sortCriteria);
    if (courses) {
      res.status(200).json({ courses });
    } else {
      res.status(200).json({ message: "No Courses Added By Consultent" });
    }
  } catch (error) {
    console.error('Error while listing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const list_consultencies = async (req, res) => {
  try {
    const consultents = await counsultentDB.getConsultantsForHome(9, { createdAt: -1 });
    res.status(200).json({ consultents });
  } catch (error) {
    console.error('Error while listing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const forgot_password = async (req, res) => {
  try {
    const userData = req.body;
    const user = await StudentDB.getUserByEmail(userData.email);
    if (!user) {
      return res.status(400).json({ message: 'User Not Found' });
    }
    const new_otp = Math.floor(1000 + Math.random() * 9000);
    await OneTimePassword.createOtp(user.email, new_otp);
    sendMail(user.email, new_otp);
    return res.status(200).json({ message: 'Please Enter OTP' });
  } catch (error) {
    console.error('Error in forgot Password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const new_password = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.user.email;
    const hashPassword = await secretHash(password);

    await StudentDB.updateUserField(email, 'password', hashPassword);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('error setting new password')
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const apply_new_course = async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.body;
    const student = await StudentDB.findStudentInfoByEmail(email);

    if (!student) {
      return res.status(400).json({ message: 'Student Not found' });
    }

    const existingCourses = await applicationDB.getApplicationsByStudent(student._id);

    const courseAlreadyApplied = existingCourses.some(course => course.course.toString() === id);

    if (courseAlreadyApplied) {
      return res.status(200).json({ message: 'Student Already Applied' });
    }

    const [createdApplication, updatedStudent] = await Promise.all([
      applicationDB.createApplication(student._id, id),
      StudentDB.addCourseToStudent(student.email,id )
    ]);
    console.log(updatedStudent);

    if (createdApplication) {
      return res.status(200).json({ message: "Course applied Successfully" });
    } else {
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const view_all_courses = async (req, res) => {
  try {
    const { page, limit ,filter ,search } = req.query;

    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    // console.log('search...',search);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const filterArray = Array.isArray(filter) ? filter : filter ? [filter] : [];
    
    const getCoursesPromise = courseDB.getCoursesByPage(skipCount, itemsPerPage ,filterArray,search);
    const getAllCountriesPromise = countryDB.getAllCountries();

    const [coursesResult, countriesResult] = await Promise.all([getCoursesPromise, getAllCountriesPromise]);

    const { courses, totalCoursesCount } = coursesResult;
    const countries = countriesResult;

    res.status(200).json({ courses, totalCoursesCount ,countries});

  } catch (error) {
    console.error('Error while viewing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const view_all_consultencies = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    const skipCount = (pageNumber - 1) * itemsPerPage;
    if (skipCount < 0) {
      throw new Error('Invalid page or limit parameters');
    }
    const { consultants, totalConsultantsCount } = await counsultentDB.getAllConsultantsByPage(skipCount, itemsPerPage);
    res.status(200).json({ consultants, totalConsultantsCount });
  } catch (error) {
    console.error('Error while viewing Consultencies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const home_countries = async (req, res) => {
  try {
    const countries = await countryDB.listLimitedCountries();
    if (!countries) {
      res.status(404).json({ message: 'No countries Found' })
    }
    res.status(200).json({ countries })
  } catch (error) {
    console.error('Error listing Countries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const listAllCountries = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const { countries, totalCount } = await countryDB.getAllCountriesByPage(skipCount, itemsPerPage)
    res.status(200).json({ countries, totalCount });
  } catch (error) {
    console.error('Error listing All Countries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getCountryCourse = async (req, res) => {
  try {
    const { countryID } = req.query
    const courses = await courseDB.getCoursesByCountry(countryID)
    res.status(200).json({ courses })
  } catch (error) {
    console.error('Error listing Courses By Countries :', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getApplications = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await StudentDB.findStudentInfoByEmail(email);
    const applications = await applicationDB.getApplicationsByStudent(user._id)
    if (!applications) {
      return res.status(404).json({ message: 'No Applications Found' });
    }

    res.status(200).json({ applications })
  } catch (error) {
    console.error('Error listing Applications of specific Student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const studentProfileCourseStatus = async (req, res) => {

  try {
    const { courseID, studentID } = req.query;
    const applied = await applicationDB.findIfStudentApplied(studentID, courseID);
    res.status(200).json({ applied });
  } catch (error) {
    console.error('Error listing Applications of specific Student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

export const getChatOfUser = async (req, res) => {
  try {
    const { id } = req.query;
    const chats = await messageRepository.getMessagesForUser(id);

    const uniqueUserIds = new Set();

    chats.forEach((chat) => {
      uniqueUserIds.add(chat.sender.toString());
      uniqueUserIds.add(chat.receiver.toString());
    });

    const otherUserIds = [...uniqueUserIds].filter((userId) => userId !== id);

    const studentsPromise = StudentDB.findArrayOfStudents(otherUserIds);
    const consultantsPromise = counsultentDB.findArrayOfConsultents(otherUserIds);

    const [students, consultants] = await Promise.all([studentsPromise, consultantsPromise]);

    const users = [...students, ...consultants];

    res.status(200).json({ chats: users });
  } catch (error) {
    console.error('Error in getChatOfUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUnreadMessageOfUsers = async (req, res) => {
  try {
    const { id } = req.query;
    const unread = await messageRepository.findUnreadMessagesById(id)
    res.status(200).json({ unread })
  } catch (error) {
    console.error('Error in getUnreadMessageOfUsers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const markUnreadForChat = async (req, res) => {
  try {
    const { reciever, sender } = req.body;
    await messageRepository.updateReadTrueForReciever(reciever, sender);
    res.status(200)
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export const newBlogByStudent = async (req, res) => {
  try {
    const blog = req.body;
    if (req.file) {
      blog.image = req.file.filename
    }
    const newBlog = await blogDB.createBlog(blog)
    res.status(200).json({ blog: newBlog, message: 'Blog Saved SuccessFully' })
  } catch (error) {
    if (error.code === 11000) {
     return res.status(400).json({ message: 'Heading must be unique' });
    }
    console.error('Error saving new blog by student as read:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export const getUserBlogs = async(req,res) => {
  try {
    const { id } = req.query;
    const blogs = await blogDB.findBlogsByCreatorId(id);
    res.status(200).json({blogs})
  } catch (error) {
    console.error('Error finding blogs by creator:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const editBlogByUser = async (req, res) => {
  try {
    const blogData = req.body;

    if (req.file) {
      blogData.image = req.file.filename;
    }

    const updatedBlog = await blogDB.updateBlog(blogData);

    if (updatedBlog) {
      res.status(200).json({ message: 'Updated blog successfully' });
    } else {
      res.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    console.error('Error editing blogs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllBlogsToList = async (req,res) => {
  try {
    const { page, limit ,search} = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const { blogs,totalBlogsCount } = await blogDB.getAllBlogs(search,skipCount, itemsPerPage);
    res.status(200).json({blogs,totalBlogsCount})
  } catch (error) {
    
  }
}

export const getUnreadBetweenUsers = async (req, res) => {
  try {
    const { id, sender } = req.query;

    if (!id || !sender) {
      return res.status(400).json({ error: 'Bad Request. Missing required parameters.' });
    }

    const unreadCount = await messageRepository.findUnreadMessagesBetweenUsers(id, sender);
    res.status(200).json({ unread: unreadCount });
  } catch (error) {
    console.error('Error in getUnreadBetweenUsers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
