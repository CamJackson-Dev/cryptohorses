const dev = {
    
    TOKEN_CONTRACT_ADDRESS: "TX9LZdwDwPV91p8TAue2ErKjpqjJ9fXt6f",
    DIVIDEND_CONTRACT_ADDRESS: "TBWKxdA5YUUzgpEq5uAYjTTkJUeuZYd3BJ",
    GAME_LOCATION_1_CONTRACT: "TMknUncdNdn2KtNb8qDfTCxCBxUFR4P8Kn",

    TRONGRID_NODE: "https://api.shasta.trongrid.io",
    SIGNER_KEY: process.env.SIGNER_KEY,
    DUMMY_PK: "677ff54c085d898025de8b8f1683c0d77f32568a6559787f4d46b5ae0fa8e767",

    MONGO_DATABASE: 'test',
    MONGODB_USERNAME: 'tronhorse',
    MONGODB_PASSWORD: 'TronDB%40%230909',
    MONGODB_IP_1: 'cluster0-fdyv4.mongodb.net',
    url: "mongodb+srv://tronhorse:TronDB%40%230909@cluster0-fdyv4.mongodb.net/test"
    // url: "mongodb://localhost:27017/test"

}
const prod = {

    TOKEN_CONTRACT_ADDRESS: "TAjAMF7XZGexASiQDfa8XJ1xFLcqtYNcrg",
    DIVIDEND_CONTRACT_ADDRESS: "TAa3BAntM7Cz5RMcci8jtN3Q8yccxGwGnF",
    GAME_LOCATION_1_CONTRACT: "TVqdSYfGpPQXeBHQUgAAqqkgCiqmvQBY1p",

    TRONGRID_NODE: "https://api.trongrid.io",
    SIGNER_KEY: process.env.SIGNER_KEY,

    DUMMY_PK: "677ff54c085d898025de8b8f1683c0d77f32568a6559787f4d46b5ae0fa8e767",

    MONGO_DATABASE: 'test',
    MONGODB_USERNAME: 'tronhorse',
    MONGODB_PASSWORD: 'TronDB%40%230909',
    MONGODB_IP_1: 'cluster0-fdyv4.mongodb.net',
    url: "mongodb+srv://winnahorse777:Y2FYYgvXGmps8QK5@cluster0-e6dbh.mongodb.net/tronhorse?retryWrites=true&w=majority"

}

module.exports = (process.env.NODE_ENV === 'prod') ? prod : dev;
