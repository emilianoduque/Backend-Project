import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://emiyaeldi85:3pGLp8lwLDDiU5kx@cluster0.zu1dy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("MongoDB conectado")
    } catch (error) {
        console.error(error.message);
    }
}

export default connectDB;