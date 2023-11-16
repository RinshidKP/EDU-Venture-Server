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

  async getConsultantsForHome(skip = 0, sort = { createdAt: 1 }) {
    try {
      const consultants = await Consultancy.find({ isVerified: true, isActive: true })
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

  async getAllConsultantsByPage(skip, limit, sortCriteria = { createdAt: -1 }) {
    try {
      const aggregationPipeline = [
        {
          $match: {
            isVerified: true,
            isActive: true,
          },
        },
        {
          $facet: {
            consultants: [
              {
                $sort: sortCriteria,
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





}

export default ConsultancyRepository;
