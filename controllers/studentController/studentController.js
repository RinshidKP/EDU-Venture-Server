import {compareSecret, secretHash} from '../../helper/secretHash.js'
import StudentRepository from '../../repository/studentRepository.js';
import OtpRepository from '../../repository/otpReprository.js';
import CourseRepository from '../../repository/courseReprository.js';
import ConsultancyRepository from '../../repository/consultentReprository.js';
import  sendMail  from '../../helper/sendMail.js';
import { generateToken } from '../../middleware/auth.js';
import ApplicationRepository from '../../repository/applicationRepository.js';
import CountriesRepository from '../../repository/countriesRepository.js';


const StudentDB = new StudentRepository();
const OneTimePassword = new OtpRepository();
const courseDB = new CourseRepository();
const counsultentDB = new ConsultancyRepository();
const applicationDB = new ApplicationRepository();
const countryDB = new CountriesRepository();

export const createStudent = async (req, res , next) => {
  try {
    const studentData = req.body;

    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(studentData.email)) {
      console.log('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const [existingUser, existingOtp] = await Promise.all([
      StudentDB.getUserByEmail(studentData.email),
      OneTimePassword.findOtpByEmail(studentData.email),
    ]);

    if (existingUser) {
      console.log("User Exists");
      res.json({error:'Email Already Exists'})
      return
    }

    if(existingOtp){
      await OneTimePassword.deleteOtpByEmail(studentData.email)
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await OneTimePassword.createOtp(studentData.email,otp);
    
    studentData.password  = await secretHash(studentData.password);
    
    const newUser = await StudentDB.createStudentUser(studentData);
    sendMail(newUser.email,otp);
    res.status(201).json(newUser);
  } catch (error) {
    // console.log(error);
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
      console.log('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const [user, storedOtp] = await Promise.all([
      StudentDB.getUserByEmail(email),
      OneTimePassword.findOtpByEmail(email),
    ]);

    if (!user) {
      console.log('no user');
      return res.status(404).json({ error: 'User not found' });
    }

    if (!storedOtp) {
      console.log('no stored otp');
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
      StudentDB.updateUserField(email, 'isVerified', true ),
      OneTimePassword.deleteOtpByEmail(email)
    ]);
    const jwtToken = generateToken(user, 'student');
    res.status(200).json({ message: 'OTP validated successfully', token: jwtToken, user ,role:'student' });

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
      console.log('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'The User is Already Verified' });
    }
    const new_otp = Math.floor(1000 + Math.random() * 9000);

    await  OneTimePassword.createOtp(user.email,new_otp);

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
      console.log('Invalid Data');
      return res.status(400).json({ error: 'Invalid Data' });
    }
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(userData.email)) {
      console.log('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }
    const user = await StudentDB.getUserByEmail(userData.email);
  
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(401).json({ message: 'User not verified' });
    }

    const passMatch = await compareSecret(userData.password, user.password);
    // console.log(passMatch);
    if (passMatch) {
      
          if(user.isAdmin){
            const jwtToken = generateToken(user, 'admin');
            return res.status(200).json({ message: 'User signed in successfully', token:jwtToken , user , role:'admin' });
          }
          const jwtToken = generateToken(user, 'student');
          return res.status(200).json({ message: 'User signed in successfully', token:jwtToken , user , role:'student' });
    }else{
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(error);
  }
};

export const loadProfile = async (req, res, next) => {
  try {
    const { email } = req.query;
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

export const updateProfile = async (req,res,next)=>{
  try {
    const studentData = req.body;
    if(req.file){
      // console.log('here ',req.file);
      studentData.profile_picture = req.file.filename
    }
    const email = req.user.email

    const user = await StudentDB.updateStudentInfoByObject(email,studentData);
    // console.log('update',req.file)
    res.status(200).json({user,message:'Profile Updated Successfully'})
  } catch (error) {
    console.error("Error while updating consultent profile:", error);
  res.status(500).json({ error: "Internal server error" });
  }
}

export const list_courses = async (req,res) => {
  try {
    const limit = 6
    const courses = await courseDB.getCourseAllCourses(limit);
      res.status(200).json({ courses });
  } catch (error) {
    console.error('Error while listing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const list_courses_by_creator = async (req,res) => {
  try {

    const id = req.query.id
    const limit = id ? 0 : 6 ;
    const sortCriteria = { createdAt: -1 };
      const courses = await courseDB.findCoursesByCreator(id ,limit, sortCriteria);
      // console.log(courses);
    if(courses){
      res.status(200).json({ courses });
    }else{
      res.status(200).json({ message:"No Courses Added By Consultent" });
    }
  } catch (error) {
    console.error('Error while listing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const list_consultencies = async (req,res) => {
  try{
    const consultents = await counsultentDB.getAllConsultants(3,{createdAt: -1});
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
      return res.status(404).json({ message: 'User Not Found' });
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
    // console.log(password);
    const hashPassword = await secretHash(password);
    
    await StudentDB.updateUserField(email, 'password', hashPassword);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log('error setting new password')
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

    const courseApplied = await applicationDB.createApplication(student._id, id);

    if (courseApplied) {
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
    const { page, limit } = req.query;

    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    const skipCount = (pageNumber - 1) * itemsPerPage;
    
    const { courses, totalCoursesCount } = await courseDB.getCoursesByPage(skipCount, itemsPerPage);
    
    res.status(200).json({ courses, totalCoursesCount });
  } catch (error) {
    console.error('Error while viewing courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const view_all_consultencies = async (req,res)=>{
  try {
    const { page, limit } = req.query;
    // console.log(page,limit);
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    const skipCount = (pageNumber - 1) * itemsPerPage;
    // console.log('itemsPerPage',itemsPerPage);
    if (skipCount < 0) { 
      throw new Error('Invalid page or limit parameters');
    }
    const { consultants, totalConsultantsCount } = await counsultentDB.getAllConsultantsByPage(skipCount, itemsPerPage);
    // console.log(consultants, totalConsultantsCount );
    res.status(200).json({ consultants, totalConsultantsCount });
  } catch (error) {
    console.error('Error while viewing Consultencies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const home_countries = async (req,res)=>{
  try {
    const countries = await countryDB.listLimitedCountries();
    if(!countries){
      res.status(404).json({message:'No countries Found'})
    }
    res.status(200).json({countries})
  } catch (error) {
    console.error('Error listing Countries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const listAllCountries = async (req,res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const {countries ,totalCount} = await countryDB.getAllCountriesByPage(skipCount, itemsPerPage)
    res.status(200).json({ countries ,totalCount });
  } catch (error) {
    
  }
}

export const getCountryCourse = async (req,res) =>{
  try {
    const {countryID} = req.query
    const courses = await courseDB.getCoursesByCountry(countryID)
    res.status(200).json({courses})
  } catch (error) {
    
  }
}
