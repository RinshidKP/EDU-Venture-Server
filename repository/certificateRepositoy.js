
import Certificates from "../models/certificateSchema.js";

class CertificatesRepository {
   async createCertificate(studentId, passportData, qualificationData) {
    try {
      const certificate = await Certificates.create({
        student: studentId,
        passport: passportData,
        qualification: qualificationData,
      });

      return certificate;
    } catch (error) {
      throw new Error(`Error creating certificate: ${error.message}`);
    }
  }

   async getCertificateByStudentId(studentId) {
    try {
      const certificate = await Certificates.findOne({ student: studentId })
        .exec();

      return certificate;
    } catch (error) {
      throw new Error(`Error getting certificate: ${error.message}`);
    }
  }

  async updatePassportWithStudentId(studentId, updatedPassportData) {
    try {
      const filter = { student: studentId };
      const update = {};
  
      // Retrieve the existing certificate
      const certificate = await Certificates.findOne(filter);
  
      if (!certificate) {
        throw new Error('Certificate not found for the specified student ID.');
      }
  
      // Update passport data
      if (updatedPassportData) {
        update.$set = { 'passport': { ...certificate.passport, ...updatedPassportData } };
      }
  
      const result = await Certificates.updateOne(filter, update);
  
      if (result.nModified === 0) {
        throw new Error('Certificate not found for the specified student ID or passport data not modified.');
      }
  
      // Return the updated certificate
      return certificate;
    } catch (error) {
      throw new Error(`Error updating passport: ${error.message}`);
    }
  }
  

  async updateQualificationWithStudentId(studentId, updatedQualificationData) {
    try {
      const filter = { student: studentId };
      const update = {};
  
      // Retrieve the existing certificate
      const certificate = await Certificates.findOne(filter);
  
      if (!certificate) {
        throw new Error('Certificate not found for the specified student ID.');
      }
  
      // Update qualification data
      if (updatedQualificationData) {
        update.$set = { 'qualification': { ...certificate.qualification, ...updatedQualificationData } };
      }
  
      const result = await Certificates.updateOne(filter, update);
      console.log(result);
      if (result.nModified === 0) {
        throw new Error('Certificate not found for the specified student ID.');
      }
  
      // Return the updated certificate
      return certificate;
    } catch (error) {
      throw new Error(`Error updating qualification: ${error.message}`);
    }
  }  
}

export default CertificatesRepository;
