module.exports={
    HOST: process.env.DBHost || "localhost",
    USER: process.env.DBUser || "csye7125_user",
    PASSWORD: process.env.DBPassword || "Asdf#12345$",
    DB: process.env.DBName || "csye7125_notifier",
    DIALECT:"mysql",
    POOL: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
