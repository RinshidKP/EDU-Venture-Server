import  express  from "express";
import { verify } from "../middleware/auth.js";
import { 
         adminDashboard,
         createCountry,
         disableCountryById,
         getCountries,
         getCountryData,
         updateCountryData
         } from "../controllers/adminController/adminController.js";
import uploadImage from "../helper/multer.js";
const router = express.Router()

router.get('/home',verify,adminDashboard);
router.get('/admin_country',verify,getCountries);
router.get('/country_data',verify,getCountryData);
router.post('/add_contries',verify,uploadImage,createCountry);
router.post('/update_countries',verify,uploadImage,updateCountryData);
router.post('/disable_country',verify,disableCountryById);

export default router;