import mongoose from "mongoose";
const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(`MongoDB COnectado en : ${url}`);
  } catch (e) {
    console.log(`Error : ${e.message}`);
    process.exit(1);
  }
};

export default conectarDB;
