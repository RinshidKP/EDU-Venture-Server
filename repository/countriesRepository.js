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
    async getAllCountries() {
      try {
        const countries = await Country.find()
      return countries ? countries : false
      } catch (error) {
        throw new Error(`Failed to find Countries :${error.message}`)
      }
    }
    async listLimitedCountries() {
      try {
        const countries = await Country.find().limit(3).sort({createdDate:-1})
        return countries ? countries : false
      } catch (error) {
        throw new Error(`Failed to list limited Countries :${error.message}`)
      }
    }

    async getAllCountriesByPage (skipCount, itemsPerPage) {
      try {
        const aggregationPipeline = [
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
        const country = await Country.findById( countryID ); 
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
      
  }
  

export default CountriesRepository;
