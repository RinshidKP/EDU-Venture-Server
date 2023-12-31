import Consultancy from '../models/consultencyModel.js';

class ConsultancyRepository {
  async createConsultant(consultantData) {
    try {
      const newConsultant = Consultancy.create(consultantData);
      return newConsultant;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create a Consultent user');
    }
  }

  async getAllConsultants(search,skipCount = 0, itemsPerPage = 0, sort = { createdAt: 1 }) {
    try {

      let query = {};
      if (search) {
        query.$or = [
          { consultancy_name: { $regex: new RegExp(search, 'i') } },
          { email: { $regex: new RegExp(search, 'i') } },
        ];
      }

      const consultents = await Consultancy.find(query)
        .skip(skipCount)
        .limit(itemsPerPage)
        .sort(sort);

      const totalConsultantsCount = await Consultancy.countDocuments();
      return { consultents, totalConsultantsCount };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to find all the verified and active consultants');
    }
  }

  async getConsultantsForHome(limit,skip = 0, sort = { createdAt: 1 }) {
    try {
      const consultants = await Consultancy.find({ isVerified: true, isActive: true })
        .limit(limit)
        .skip(skip)
        .sort(sort);
      return consultants;
    } catch (error) {
      // Handle the error appropriately
      console.error(error);
      throw new Error('Failed to get consultants for home');
    }
  }



  async getConsultantByEmail(email) {
    try {
      const consultant = await Consultancy.findOne({ email: email });
      return consultant;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to find the Consultent user by email');
    }
  }

  async updateConsultant(consultantEmail, fieldName, newValue) {
    try {
      const updatedConsultant = await Consultancy.findOneAndUpdate({ email: consultantEmail }, { [fieldName]: newValue }, { new: true });
      return updatedConsultant;
    } catch (error) {
      throw error;
    }
  }

  async updateConsultantInfoByObject(consultantEmail, obj) {
    try {
      const updatedConsultant = await Consultancy.findOneAndUpdate({ email: consultantEmail }, obj, { new: true });
      return updatedConsultant;
    } catch (error) {
      throw error;
    }
  }

  async deleteConsultant(email) {
    try {
      const deletedConsultant = await Consultancy.findOneAndDelete({ email: email });
      return deletedConsultant;
    } catch (error) {
      throw error;
    }
  }

  async getAllConsultantsByPage(skip, limit,search, sortCriteria ) {
    try {

      const matchCondition = {
        isVerified: true,
        isActive: true,
      };
  
      if (search) {
        matchCondition.$or = [
          { consultancy_name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      
      const aggregationPipeline = [
        {
          $match: matchCondition,
        },
        {
          $facet: {
            consultants: [
              {
                $sort: { consultancy_name: parseInt(sortCriteria) },
              },
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
            ],
            totalConsultantsCount: [
              {
                $count: 'count',
              },
            ],
          },
        },
      ];

      const result = await Consultancy.aggregate(aggregationPipeline).exec();
      const consultants = result[0].consultants;
      const totalConsultantsCount = result[0].totalConsultantsCount[0]?.count || 0;

      return { consultants, totalConsultantsCount };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to find consultants and count');
    }
  } 

  async updateConsultantAccessByID(id) {
    try {
      let consultant = await Consultancy.findById(id)
      consultant.isActive = !consultant.isActive
      await consultant.save();
      return consultant
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update consultant by ID');
    }
  }

  async findArrayOfConsultents(objectIds) {
    try {
      const consultants = await Consultancy.find({ _id: { $in: objectIds } });
      return consultants;
    } catch (error) {
      console.error('Error in findArrayOfConsultents:', error);
      throw error;
    }
  }
  async findConsultentById(id){
    try {
      const consultant = await Consultancy.findById(id);
      return consultant
    } catch (error) {
      console.error('Error in findConsultentById:', error);
      throw error;
    }
  }

  async totalConsultantsCount(){
    try {
      return await Consultancy.countDocuments()
    } catch (error) {
      console.error('Error:', error);
    }
  }
  async findUnApprovedConsultants() {
    try {
      return await Consultancy.find({isActive:false}).limit(10).sort({createdAt:-1})
    } catch (error) {
      console.error('Error:', error);
    }
  }


}

export default ConsultancyRepository;
