const { default: mongoose } = require("mongoose");
require("dotenv/config");

mongoose.Promise = global.Promise;

const { DB_USER, DB_PASS, DB_NAME, DB_URL } = process.env;

mongoose
    .connect(`mongodb+srv://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado ao MongoDB!"))
    .catch((e) => console.log(e));
