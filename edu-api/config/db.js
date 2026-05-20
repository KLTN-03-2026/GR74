const mongoose = require('mongoose');

const connectDB = () => {
  const URI = process.env.MONGODB_URL;
  mongoose.connect(
    URI,
    {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw err;
      console.log("Kết nối cơ sở dữ liệu thành công tới MongoDB");
    }
  );
};

module.exports = connectDB;
