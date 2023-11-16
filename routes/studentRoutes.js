import  express  from "express";
import {
    createStudent,resend_otp,
    validateOtp,loadProfile,
    handleSignin,updateProfile,
    list_courses,list_consultencies,
    view_all_courses,forgot_password,
    new_password,
    view_all_consultencies,
    list_courses_by_creator,
    apply_new_course,
    home_countries,
    listAllCountries,
    getCountryCourse,
    getApplications,
    studentProfileCourseStatus,
    getChatOfUser,
    getUnreadMessageOfUsers,
    markUnreadForChat,
    newBlogByStudent,
    getUserBlogs,
    editBlogByUser,
    getAllBlogsToList,
    getUnreadBetweenUsers
} from '../controllers/studentController/studentController.js';
import { verify } from "../middleware/auth.js";
import uploadImage from "../helper/multer.js";
const router = express.Router()

//Auth
router.post('/forgot_password',forgot_password);
router.post('/signup',createStudent);
router.post('/otpvalidate',validateOtp);
router.post('/login',handleSignin);
router.post('/new_password',verify,new_password);
router.get('/resend_otp',resend_otp);

//Profile
router.get('/profile',verify,loadProfile);
router.post('/update_profile',verify,uploadImage,updateProfile);
router.get('/student_course',verify,getApplications);
router.get('/student_application',verify,studentProfileCourseStatus);
router.post('/create_blog',verify,uploadImage,newBlogByStudent);
router.post('/edit_blog',verify,uploadImage,editBlogByUser);
router.get('/user_blogs',verify,getUserBlogs);
router.get('/blogs_data',verify,getAllBlogsToList);

//Home
router.get('/list_courses',list_courses);
router.get('/list_all_countries',listAllCountries);
router.get('/list_consultencies',list_consultencies);
router.get('/consultent_courses',list_courses_by_creator);
router.get('/view_courses',view_all_courses);
router.get('/view_consultencies',view_all_consultencies);
router.post('/apply_course',verify,apply_new_course);
router.get('/home_countries',home_countries);
router.get('/list_country_courses',getCountryCourse);

//Chat
router.get('/chat_list',verify,getChatOfUser);
router.get('/unread_messages',verify,getUnreadMessageOfUsers);
router.post('/mark_read',verify,markUnreadForChat);
router.get(`/unread_between_users`,verify,getUnreadBetweenUsers);


export default router;