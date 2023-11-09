import  express  from "express";
import { verify } from "../middleware/auth.js";
import { 
         adminDashboard,
         changeConsultencyAccess,
         createCountry,
         disableCountryById,
         getConsultentData,
         getCountries,
         getCountryData,
         updateCountryData
         } from "../controllers/adminController/adminController.js";
import uploadImage from "../helper/multer.js";
const router = express.Router()

router.get('/home',verify,adminDashboard);
router.get('/admin_country',verify,getCountries);
router.get('/country_data',verify,getCountryData);
router.get('/consultent_data',verify,getConsultentData);
router.post('/add_contries',verify,uploadImage,createCountry);
router.post('/update_countries',verify,uploadImage,updateCountryData);
router.post('/disable_country',verify,disableCountryById);
router.post('/consultant_access',verify,changeConsultencyAccess);   


export default router;