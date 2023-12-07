import Country from '../models/countriesSchema.js';

class CountriesRepository {
  async createCountry(countryData) {
    try {
      const savedCountry = await Country.create(countryData);
      return savedCountry;
    } catch (error) {
      throw new Error(`Failed to create country: ${error.message}`);
    }
  }
  async findCountryByName(name) {
    try {
      const country = await Country.findOne({ name: name });
      if (country) {
        return country;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(`Failed to find country by name: ${error.message}`);
    }
  }
  async getCountries(){
    try {
      return await Country.find();
    } catch (error) {
      throw error
    }
  }
  async getAllCountries(skip=0, limit=0, search, spell ,filter) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = Country.find();
  
        if (search) {
          query = query.find({ name: { $regex: search, $options: 'i' } });
        }
        if(filter !== 0) {
          query = query.where(filter);
        }
  
        query = query.sort({ name: parseInt(spell) });

        const countries = await query.skip(skip).limit(limit);
  
        const totalCount = await Country.countDocuments();
  
        resolve({ countries, totalCount });
      } catch (error) {
        reject(`Failed to find Countries: ${error.message}`);
      }
    });
  }
  async listLimitedCountries() {
    try {
      const countries = await Country.find({ isActive: true }).limit(4).sort({ createdDate: -1 })
      return countries ? countries : false
    } catch (error) {
      throw new Error(`Failed to list limited Countries :${error.message}`)
    }
  }

  async getAllCountriesByPage(skipCount, itemsPerPage, search, sortCriteria) {
    try {

      const matchCondition = {
        isActive: true,
      };

      if (search) {
        matchCondition.$or = [
          { name: { $regex: search, $options: 'i' } },
        ];
      }

      const aggregationPipeline = [
        {
          $match: matchCondition,
        },
        {
          $sort: { name: parseInt(sortCriteria) },
        },
        {
          $skip: skipCount,
        },
        {
          $limit: itemsPerPage,
        },
      ]

      const countries = await Country.aggregate(aggregationPipeline);

      const totalCount = await Country.countDocuments();

      return { countries, totalCount };
    } catch (error) {
      throw new Error(`Failed to get all Countries :${error.message}`)
    }
  }

  async getCountryData(countryID) {
    try {
      const country = await Country.findById(countryID);
      if (country) {
        return country;
      } else {
        throw new Error("Country not found");
      }
    } catch (error) {
      throw new Error("An error occurred while fetching country data");
    }
  }
  async updateCountryByID(id, data) {
    try {
      const updatedCountry = await Country.findByIdAndUpdate(id, data, { new: true });

      if (!updatedCountry) {
        return null;
      }

      return updatedCountry;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async disableCountryOrActivate(id) {
    try {
      const country = await Country.findById(id);
      if (country) {
        country.isActive = !country.isActive;

        await country.save();
        return country
      } else {
        // Handle the case where the country with the specified `id` is not found.
      }
      return country
    } catch (error) {

    }
  }
  async getCountriesWithCourseCount() {
    try {
      const aggregationPipeline = [
        {
          $match: {
            isActive: true,
          },
        },
        {
          $lookup: {
            from: 'courses', // Collection name for courses
            localField: '_id',
            foreignField: 'country',
            as: 'courses',
          },
        },
        {
          $addFields: {
            courseCount: { $size: '$courses' },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isActive: 1,
            description: 1,
            createdDate: 1,
            image: 1,
            courseCount: 1,
          },
        },
      ];

      const countriesWithCourseCount = await Country.aggregate(aggregationPipeline);

      return countriesWithCourseCount;
    } catch (error) {
      throw error;
    }
  }
}


export default CountriesRepository;
