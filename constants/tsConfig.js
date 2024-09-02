let tsConfig = {
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "@constants": ["src/constants/index.ts"],
            "@assets/*": ["src/assets/*"],
            "@helpers": ["src/helpers/index.ts"],
            "@screens": ["src/screens/index.ts"]
        }
    },
    "include": ["src/**/*"]
}
export default tsConfig;