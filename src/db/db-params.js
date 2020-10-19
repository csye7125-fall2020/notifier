module.exports={
    HOST: process.env.DBHost || "localhost",
    USER: process.env.DBUser || "user",
    PASSWORD: process.env.DBPassword || "P@ssw0rd",
    DB: process.env.DBName || "csye7125_notifier",
    DIALECT:"mysql",
    POOL: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
