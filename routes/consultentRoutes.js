import express from "express";
import { verify } from "../middleware/auth.js";
import {
    createConsultancy,
    validateOtp, handleSignin,
    resend_otp, loadProfile,
    updateProfile, load_courses,
    create_courses,
    list_consultant_courses, updateCourse,
    forgot_password, new_password,
    loadStudents, list_create_countries,
    acceptStudent, declineStudent, getChatOfUser,
    getUnreadMessageOfUsers, markUnreadForChat,
    getUnreadBetweenUsers,
    recieverDetailsId,
    getDashboardDetails,
} from '../controllers/consultencyController/consultencyController.js'
import uploadImage from "../helper/multer.js";
const router = express.Router()

// Validation
router.post('/signup', createConsultancy);
router.post('/otpvalidate', validateOtp);
router.post('/login', handleSignin);
router.get('/resend_otp', resend_otp);
//Students
router.get('/students_consultent', verify, loadStudents);
router.post('/accept_candidate', verify, acceptStudent);
router.post('/decline_candidate', verify, declineStudent);

//profile
router.get('/profile', verify, loadProfile);
router.post('/update_profile', verify, uploadImage, updateProfile);
router.post('/forgot_password', forgot_password);
router.post('/new_password', verify, new_password);
//Courses
router.get('/load_courses', verify, load_courses);
router.get('/list_countries', verify, list_create_countries);
router.post('/create_courses', verify, uploadImage, create_courses);
router.get('/consultent_courses', verify, list_consultant_courses)
router.post('/update_course', verify, uploadImage, updateCourse);

//chat
router.get('/unread_messages', verify, getUnreadMessageOfUsers);
router.post('/mark_read', verify, markUnreadForChat);
router.get('/chat_list', verify, getChatOfUser);
router.get(`/unread_between_users`, verify, getUnreadBetweenUsers);
router.get(`/reciever_details`,verify,recieverDetailsId);
router.get(`/consultant_dashboard`,verify,getDashboardDetails);



export default router;