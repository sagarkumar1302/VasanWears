import mongoose from "mongoose"
import dbName from "../constans.js"
const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: dbName,
        })
        console.log("Mongo db connected ", connect.connection.host);

    } catch (error) {
        console.log("Mongo db connection error", error);
        process.exit(1);
    }
}
export default connectDb;