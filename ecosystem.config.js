export default {
    apps: [{
        name: "API-RKH",
        script: "src/main.js",
        cwd: "./",

        exec_mode: "fork",
        instances: 1,
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        out_file: "./logs/pm2-out.log",
        error_file: "./logs/pm2-error.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",

        watch: false
    },],
};