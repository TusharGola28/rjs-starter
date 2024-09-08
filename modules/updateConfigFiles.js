import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const updateConfigFiles = async (answers) => {
    const projectPath = path.join(process.cwd(), answers.projectName);
    const srcPath = path.join(projectPath, 'src');

    try {
        // Create src directory
        if (!fs.existsSync(srcPath)) {
            fs.mkdirSync(srcPath);
            console.log(chalk.green('√ src directory created successfully.'));
        } else {
            console.log(chalk.yellow('src directory already exists.'));
        }

        // Create any additional folders like "components", "assets", etc.
        const foldersToCreate = ['components', 'assets', 'layouts', 'pages', 'services', 'svg', 'utils', 'routes', 'helpers', 'functions', 'features', 'constants', 'store'];
        foldersToCreate.forEach(folder => {
            const folderPath = path.join(srcPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
                console.log(chalk.green(`√ ${folder} directory created successfully.`));
            }
            if (!['assets'].includes(folder)) {
                // Create an index file inside each folder
                const indexFileName = answers.language == 'TypeScript' || answers.language == 'TypeScript + SWC' ? 'index.tsx' : 'index.jsx';                
                const indexFilePath = path.join(folderPath, indexFileName);
                const indexFileContent = `// ${folder} module entry point`;

                fs.writeFileSync(indexFilePath, indexFileContent);
                console.log(chalk.green(`√ ${indexFileName} file created in ${folder} folder successfully.`));
            }
        });

    } catch (error) {
        console.log(chalk.red(`Failed to update config files: ${error.message}`));
    }
};

export default updateConfigFiles;
