import imageCloudUpload from "../../helper/couldUpload.js";
import ConsultancyRepository from "../../repository/consultentReprository.js";
import CountriesRepository from "../../repository/countriesRepository.js";
import CourseRepository from "../../repository/courseReprository.js";
import StudentRepository from "../../repository/studentRepository.js"

const studentDB = new StudentRepository();
const consultentDB = new ConsultancyRepository();
const countryDB = new CountriesRepository();
const courseDB = new CourseRepository();

export const studentsDatas = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const email = req.user.email;
    if (!email) {
      res.status(400).json({ error: 'Admin Not Found' });
    }
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const { students, totalStudentsCount } = await studentDB.listStudentsForAdmin(
      search,
      skipCount,
      itemsPerPage
    );
    res.json({ students, totalStudentsCount });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCountry = async (req, res) => {
    try {
      const countryData = req.body;
      // countryData.image = req.file.filename;
      countryData.image = await imageCloudUpload(req.file)
      // console.log('adding...');
      const existingCountry = await countryDB.findCountryByName(countryData.name);
  
      if (existingCountry) {
        res.status(409).json({ message: 'Country with the same name already exists' });
        return;
      }
  
      const newCountry = await countryDB.createCountry(countryData);
      res.status(200).json({ newCountry,message: 'Country Created Successfully', country: newCountry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  export const getCountries = async (req,res) => {
    try {
      const countries = await countryDB.getAllCountries()
      res.status(200).json({countries})
    } catch (error) {
      
    }
  }

  export const getCountryData = async (req, res) => {
    try {
      const { id } = req.query;
      // console.log(req.query.id); 
      const country = await countryDB.getCountryData(id);
   
      if (country) {
        res.status(200).json({ country });
      } else {
        res.status(404).json({ error: 'Country not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching country data' });
    }
  };

  export const updateCountryData = async (req,res) => {
    try {
      const  countryData = req.body;
      const id = countryData.id
      if(req.file){
        countryData.image = await imageCloudUpload(req.file)
      }
      const updateCountry = await countryDB.updateCountryByID(id,countryData);
      res.status(200).json({ updateCountry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred updating country data' });
    }
  }

export const disableCountryById = async (req,res) => {
  try {
    const { id } = req.body;
    // console.log(id);
    const country = await countryDB.disableCountryOrActivate(id)
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.status(200).json({isActive:country.isActive, message: `Country ${country.isActive ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while disabling/enabling the country' });
  }
  };

export const getConsultentData = async (req,res)=>{
  try {
    const { page, limit ,search} = req.query;
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const { consultents , totalConsultantsCount } = await consultentDB.getAllConsultants(search,skipCount, itemsPerPage);
    if(!consultents){
      return res.status(404).json({message:'consultents not found'})
    }

    const consultentIds = consultents.map((consultant) => consultant._id);

    const coursesCountByConsultant = await courseDB.getCourseCountByCreator(consultentIds);

    const consultantsWithCoursesCount = consultents.map((consultant) => {
      const courseCountObj = coursesCountByConsultant.find((item) => item._id.equals(consultant._id));
      return {
        ...consultant._doc,
        coursesCount: courseCountObj ? courseCountObj.count : 0,
      };
    });

    res.status(200).json({consultents: consultantsWithCoursesCount,totalConsultantsCount})

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while getting Consultents' });
  }
}

export const changeConsultencyAccess = async (req, res) => {
  try {
      const { id } = req.body;
      const consultant = await consultentDB.updateConsultantAccessByID(id);

      if (!consultant) {
          return res.status(400).json({ message: consultant.message });
      }

      const coursesCountByConsultant = await courseDB.getCourseCountByConsultantId(consultant._id);
      const consultantsWithCoursesCount = {...consultant._doc,coursesCount:coursesCountByConsultant}
      

      res.status(200).json({ consultant:consultantsWithCoursesCount,message: 'Consultant updated successfully' });
  } catch (error) {
      console.error('Error changing consultant access:', error);
      res.status(500).json({ message: 'An error occurred while changing consultant access' });
  }
}

export const changeStudentAccess = async (req,res)=> {
  try {
    const { id } = req.body;
    const student = await studentDB.updateStudentAccessById(id);

    if (!student) {
      return res.status(400).json({ message: 'student not Found' });
    }

    res.status(200).json({student})

  } catch (error) {
    console.error('Error changing student access:', error);
    res.status(500).json({ message: 'An error occurred while changing student access' });
  }
}

export const getDashboardDetails = async (req, res) => {
  try {
    const [studentsCount, consultantsCount, courseCount, countriesWithCourseCount,unApprovedConsultants] = await Promise.all([
      studentDB.totalStudentsCount(),
      consultentDB.totalConsultantsCount(),
      courseDB.totalCourseCount(),
      countryDB.getCountriesWithCourseCount(),
      consultentDB.findUnApprovedConsultants(),
    ]);
    res.status(200).json({ studentsCount, consultantsCount, courseCount, countriesWithCourseCount ,unApprovedConsultants});
  } catch (error) {
    console.error('Error Getting Dashboard Details:', error);
    res.status(500).json({ message: 'An error occurred while Getting Dashboard Details' });
  }
};
