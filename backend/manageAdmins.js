require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

// --- List all the admins you want to create or update here ---
const adminsToCreateOrUpdate = [
  {
    email: 'gottakirankumar@gmail.com', // Your email
    password: '5457'      // Your new secure password
  },
  {
    email: 'yraokuna@gmail.com',          // HOD's email
    password: 'yogi'      // A secure password for the HOD
  }
];
// ----------------------------------------------------------------

const setupAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected.');

    for (const adminData of adminsToCreateOrUpdate) {
      if (!adminData.password) {
        console.warn(`SKIPPING: No password provided for ${adminData.email}`);
        continue;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Find an existing admin or create a new one (upsert)
      const result = await Admin.findOneAndUpdate(
        { email: adminData.email },
        { $set: { password: hashedPassword } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      console.log(`✅ Successfully processed admin: ${result.email}`);
    }

    mongoose.connection.close();
    console.log('✅ All admins have been processed. Connection closed.');

  } catch (error) {
    console.error('❌ Error during admin setup:', error);
    process.exit(1);
  }
};

setupAdmins();