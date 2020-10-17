module.exports={
    HOST: process.env.DBHost || "localhost",
    USER: process.env.DBUser || "root",
    PASSWORD: process.env.DBPassword || "root",
    DB: process.env.DBName || "csye7125_notifier",
    DIALECT:"mysql",
    POOL: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
