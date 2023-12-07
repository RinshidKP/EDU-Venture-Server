import {compareSecret, secretHash} from '../../helper/secretHash.js'
import ConsultancyRepository from '../../repository/consultentReprository.js';
import OtpRepository from '../../repository/otpReprository.js';
import  sendMail  from '../../helper/sendMail.js';
import { generateToken } from '../../middleware/auth.js';
import CourseRepository from '../../repository/courseReprository.js';
import StudentRepository from '../../repository/studentRepository.js';
import ApplicationRepository from '../../repository/applicationRepository.js';
import CountriesRepository from '../../repository/countriesRepository.js';
import messageRepository from '../../repository/chatRepository.js';
import imageCloudUpload from '../../helper/couldUpload.js'
import CertificatesRepository from '../../repository/certificateRepositoy.js';

const ConsultancyDB = new ConsultancyRepository();
const otpModel = new OtpRepository();
const courseDB = new CourseRepository();
const studentDB = new StudentRepository();
const applicationDB = new ApplicationRepository();
const countryDB = new CountriesRepository();
const certificateDB = new CertificatesRepository();

export const createConsultancy = async (req, res , next) => {
  try {
    const consultencyData = req.body;

    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(consultencyData.email)) {
      console.error('Invalid Email Address');
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const [existingUser, existingOtp] = await Promise.all([
      ConsultancyDB.getConsultantByEmail(consultencyData.email),
      otpModel.findOtpByEmail(consultencyData.email),
    ]);

    if (existingUser) {
      console.error("User Exists");
      res.json({error:'Email Already Exists'})
      return
    }

    if(existingOtp){
      await otpModel.deleteOtpByEmail(consultencyData.email)
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await otpModel.createOtp(consultencyData.email,otp);
    consultencyData.password  = await secretHash(consultencyData.password);
    
    const newUser = await ConsultancyDB.createConsultant(consultencyData);
    sendMail(newUser.email,otp);
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
      ConsultancyDB.getConsultantByEmail(email),
      otpModel.findOtpByEmail(email),
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
      ConsultancyDB.updateConsultant(email, 'isVerified', true ),
      otpModel.deleteOtpByEmail(email)
    ]);
    const jwtToken = generateToken(user, 'consultent');
    res.status(200).json({ message: 'OTP validated successfully', token: jwtToken, user ,role:'consultent'});

  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resend_otp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [user, deleted] = await Promise.all([
      ConsultancyDB.getConsultantByEmail(email),
      otpModel.deleteOtpByEmail(email)
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

    await  otpModel.createOtp(user.email,new_otp);

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
    const user = await ConsultancyDB.getConsultantByEmail(userData.email);
  
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isVerified) {
      console.error('User not verified');
      return res.status(401).json({ message: 'User not verified' });
    }
    if (!user.isActive) {
      console.error('Access Restricted Contact Admin');
      return res.status(401).json({ message: 'Access Restricted Contact Admin' });
    }
    const passMatch = await compareSecret(userData.password, user.password);
    if (passMatch) {
          const jwtToken = generateToken(user);
          return res.status(200).json({ message: 'User signed in successfully',token:jwtToken ,user,role:user.role });
    }else{
      console.error('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(error);
  }
};

export const loadProfile = async (req,res,next)=>{
  try {
    const { email } = req.query;
    const user = await ConsultancyDB.getConsultantByEmail(email)
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
    
  } catch (error) {
    console.error("Error loading consultent profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateProfile = async (req,res,nect)=>{
    try {
      const consultencyData = req.body;
      if(req.file){
        // consultencyData.profile_image = req.file.filename;
        const image = await imageCloudUpload(req.file);
        consultencyData.profile_image = image
        // console.log(image);
      }
      const email = req.user.email
      if(consultencyData.countries){
        let countriesString = consultencyData.countries; 
        let countries = countriesString.split(',').map((country) => country.trim());
        consultencyData.countries = countries
      }
      const user = await ConsultancyDB.updateConsultantInfoByObject(email,consultencyData);
      res.status(200).json({user,message:'Profile Updated Successfully'})
    } catch (error) {
      console.error("Error while updating consultent profile:", error);
    res.status(500).json({ error: "Internal server error" });
    }
}

export const load_courses = async (req,res,next)=> {
  try {
    const creator =await ConsultancyDB.getConsultantByEmail(req.user.email)
    const courses =await courseDB.findCoursesByCreator(creator._id)
    res.status(200).json({courses})
  } catch (error) {
    console.error("Error while loading consultant's courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const create_courses = async (req,res,next)=>{
  try {
    const courseData = req.body
    if(!req.file||!req.file.filename){
      res.status(404).json({ error: "Image not found" });
    }
    const user = await ConsultancyDB.getConsultantByEmail(req.user.email)
    courseData.creator_id = user._id
    courseData.course_image = await imageCloudUpload(req.file)
    // courseData.course_image=req.file.filename
    const newCourse = await courseDB.createCourse(courseData)
    res.status(201).json(newCourse);
  } catch (error) { 
    console.error('Error creating a course:', error);
    res.status(500).json({ error: 'Failed to create a new course' });
  }
}

export const list_consultant_courses = async (req, res, next) => {
  try {
    const email = req.user.email;
    
    const user = await ConsultancyDB.getConsultantByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'Consultant not found' });
    }

    const courses = await courseDB.findCoursesByCreator(user._id);
    

    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error listing consultant courses:', error);
    res.status(500).json({ error: 'Failed to retrieve consultant courses' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const courseData = req.body;
    if(req.file){
      // courseData.course_image = req.file.filename
      courseData.course_image = await imageCloudUpload(req.file)
    }
    // console.log(courseData);
    if (courseData.is_active === 'false') {
      const studentsExist = await applicationDB.getApplicationsByCourse(courseData.id);
    
      if (studentsExist.length > 0) {
        return res.status(409).json({ message: 'Cannot disable because users exist.' });
      }
    }
    
    const newer = await courseDB.updateCourse(courseData.id, courseData);
    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgot_password = async (req,res) => {
  try {

    const userData = req.body ;
    
    const user = await ConsultancyDB.getConsultantByEmail(userData.email)
    if(!user){
      return res.status(404).json({message:'User Not Found'})
    }
    const new_otp = Math.floor(1000 + Math.random() * 9000);

    await  otpModel.createOtp(user.email,new_otp);
    sendMail(user.email,new_otp);

    res.status(200).json({ message: 'Please Enter OTP' });

  } catch (error) {
    console.error('Error In Forgot Password :', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const new_password = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.user.email;
    const hashPassword = await secretHash(password);
    
    await ConsultancyDB.updateConsultant(email, 'password', hashPassword);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('error setting new password')
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loadStudents = async (req, res) => {
  try {
    const email = req.user.email; 
    const { page , limit , search , date ,status ,payment} = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;

    const consultant = await ConsultancyDB.getConsultantByEmail(email);
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    } 

    const { applications, totalApplicationsCount } =
     await applicationDB.findApplicationsByCourseCreator(
      consultant._id,skipCount,itemsPerPage,search,date,status,payment
      );
    res.status(200).json({ applications,totalApplicationsCount});
  } catch (error) {
    console.error('Error while loading students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const list_create_countries = async (req, res) => {
  try {
    const countries = await countryDB.getAllCountries();
    res.status(200).json({ countries });
  } catch (error) {
    console.error('Error while loading countries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const acceptStudent = async (req,res)=>{
  try {
    const { id } = req.body
    const [success, studentData] = await Promise.all([
      applicationDB.updateApplication(id, { status: 'Accepted' }),
      applicationDB.getApplicationById(id),
    ]);
    res.status(200).json({message:'Accepted Successfully',studentData})
  } catch (error) {
    console.error('Error while Accepting Student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const declineStudent = async (req,res)=>{
  try {
    const { id } = req.body
    const [success, studentData] = await Promise.all([
      applicationDB.updateApplication(id, { status: 'Rejected' }),
      applicationDB.getApplicationById(id),
    ]);
    res.status(200).json({message:'Rejected Successfully',studentData})
  } catch (error) {
    console.error('Error while Declining Student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const initiatePayment = async (req,res)=>{
  try {
    const { id } = req.body
    const [success, studentData] = await Promise.all([
      applicationDB.updateApplication(id, { paymentStatus: 'Initiated' }),
      applicationDB.getApplicationById(id),
    ]);
    res.status(200).json({message:'Payment Initiated Successfully',studentData})
  } catch (error) {
    console.error('Error while Payment Initiation For Student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getChatOfUser = async (req,res) => {
  try {
    const {id} = req.query;
    const chats = await messageRepository.getMessagesForUser(id);
    
    const uniqueUserIds = new Set();

    chats.forEach((chat) => {
      uniqueUserIds.add(chat.sender.toString());
      uniqueUserIds.add(chat.receiver.toString());
    });

    const otherUserIds = [...uniqueUserIds].filter((userId) => userId !== id);

    const studentsPromise = studentDB.findArrayOfStudents(otherUserIds);
    const consultantsPromise = ConsultancyDB.findArrayOfConsultents(otherUserIds);

    const [students, consultants] = await Promise.all([studentsPromise, consultantsPromise]);
    
    const users = [...students, ...consultants];

    const userPromises = users.map(async user => {
      const userLatestMessage = await messageRepository.getMessagesForUser(id, user._id);
      const newlatestMessage = userLatestMessage.find(msg => {
        return (
          (msg.sender.toString() === id.toString() && msg.receiver.toString() === user._id.toString()) ||
          (msg.sender.toString() === user._id.toString() && msg.receiver.toString() === id.toString())
        );
      });
      return {
        ...user.toObject(),
        latestMessage: newlatestMessage || null,
      };
    });
    
    
      const usersWithMessages = await Promise.all(userPromises);

    res.status(200).json({ chats: usersWithMessages });
  } catch (error) {
    console.error('Error in getChatOfUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getUnreadMessageOfUsers = async(req,res) => {
  try {
    const { id } =req.query;
    const unread = await messageRepository.findUnreadMessagesById(id)
    res.status(200).json({unread})
  } catch (error) {
    console.error('Error in getUnreadMessageOfUsers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const markUnreadForChat = async (req,res) => {
  try {
    const {reciever,sender} = req.body;
    await messageRepository.updateReadTrueForReciever(reciever,sender);
    res.status(200)
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
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

export const recieverDetailsId = async (req,res) => {
  try {
    const {id} = req.query ;
    const [student,consultant] = await Promise.all([
      studentDB.findStudentWithId(id),
      ConsultancyDB.findConsultentById(id),
    ]); 
    const  result = consultant|| student
    
    if(!result){
      return res.status(404).json({message:'Something went wrong User not Found'})
    }
    // console.log(result);
    res.status(200).json({user:result})
  } catch (error) {
    console.error('Error in recieverDetailsId:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getDashboardDetails = async (req, res) => {
  try {
    const {id}= req.query;
    const [ applicationCount , acceptedStudents , courses ,coursesWithApplicationCount,pendingApplications] = await Promise.all([
      applicationDB.getApplicationCountByCreatorId(id),
      applicationDB.getAcceptedStudentsCountByCreatorId(id),
      courseDB.findCoursesByCreator(id),
      courseDB.getCoursesWithApplicationCountByCreatorId(id),
      applicationDB.getAllPendingApplicationsByCreatorId(id),
    ]);
    // console.log(pendingApplications);
    const courseCount = courses ? courses.length : 0
    res.status(200).json({  applicationCount,acceptedStudents, courseCount,coursesWithApplicationCount,pendingApplications});
  } catch (error) {
    console.error('Error Getting Dashboard Details:', error);
    res.status(500).json({ message: 'An error occurred while Getting Dashboard Details', error: error.message });
  }
};

export const getStudentCertificates = async (req,res) =>{
  try {
    const {studentId } = req.query ;
    const certificate = await  certificateDB.getCertificateByStudentId(studentId);
    if(!certificate){
      return res.json({certificate:false})
    }
    res.status(200).json({certificate})
  } catch (error) {
    console.error('Error Getting Certificate Details:', error);
    res.status(500).json({ message: 'An error occurred while Getting Certificate Details', error: error.message });
  }
}