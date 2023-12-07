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
    getUnreadBetweenUsers,
    recieverDetailsId,
    checkOutInitiation,
    checkoutSuccess,
    checkoutConfirm,
    savePassportChanges,
    saveQualificationChanges
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
router.post('/resend_otp',resend_otp);

//Profile
router.get('/profile',verify,loadProfile);
router.get('/student_course',verify,getApplications);
router.get('/student_application',verify,studentProfileCourseStatus);
router.get('/user_blogs',verify,getUserBlogs);

router.post('/create_blog',verify,uploadImage,newBlogByStudent);
router.post('/edit_blog',verify,uploadImage,editBlogByUser);
router.post('/update_profile',verify,uploadImage,updateProfile);
router.post('/passport_changes',verify,uploadImage,savePassportChanges);
router.post('/qualification_changes',verify,uploadImage,saveQualificationChanges);

//Home
router.get('/list_courses',list_courses);
router.get('/list_all_countries',listAllCountries);
router.get('/list_consultencies',list_consultencies);
router.get('/consultent_courses',list_courses_by_creator);
router.get('/view_consultencies',view_all_consultencies);
router.get('/home_countries',home_countries);
router.get('/list_country_courses',getCountryCourse);
router.get('/blogs_data',getAllBlogsToList);

//Course 
router.get('/view_courses',view_all_courses);
router.post('/apply_course',verify,apply_new_course);

//Chat
router.get('/chat_list',verify,getChatOfUser);
router.get('/unread_messages',verify,getUnreadMessageOfUsers);
router.get(`/unread_between_users`,verify,getUnreadBetweenUsers);
router.get(`/reciever_details`,verify,recieverDetailsId);
router.post('/mark_read',verify,markUnreadForChat);


//Payment
router.post('/create_check_out',verify,checkOutInitiation)
router.post('/checkout_success',verify,checkoutSuccess)
router.post('/checkout_confirm',verify,checkoutConfirm)

export default router;