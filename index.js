import fs from 'fs';
import path, { dirname } from 'path';
import spawn from 'cross-spawn';
import chalk from 'chalk';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import ora from 'ora';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import updateConfigFiles from './modules/updateConfigFiles.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const colors = ['green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
let loaderColorIntervalInstance;
const startLoader = (message) => {
    const spinner = ora({
        text: message,
        spinner: {
            "interval": 80,
            "frames": [
                "⣾",
                "⣽",
                "⣻",
                "⢿",
                "⡿",
                "⣟",
                "⣯",
                "⣷"
            ]
        },
    });
    loaderColorIntervalInstance = setInterval(() => spinner.color = colors[(Math.random() * colors.length).toFixed()], 1000);
    return spinner;
}
const executeCommandForDependencies = async (answers) => {
    const packageManager = answers.packageManager || 'npm'; // Default to npm if no package manager is specified
    const commands = [
        // {
        //     name: '-all dependency',
        //     command: packageManager,
        //     args: [],
        // },
        {
            name: 'react-router-dom',
            command: packageManager,
            args: getInstallArgs(packageManager, 'react-router-dom'),
        },
        {
            name: 'axios',
            command: packageManager,
            args: getInstallArgs(packageManager, 'axios'),
        }
    ];

    if (answers.jwtDecoder) {
        commands.push({
            name: 'jwt-decode',
            command: packageManager,
            args: getInstallArgs(packageManager, 'jwt-decode'),
        });
    }

    if (answers.language === 'TypeScript') {
        commands.push(
            {
                name: '@types/node',
                command: packageManager,
                args: getInstallArgs(packageManager, '@types/node', true),
            },
            {
                name: 'path',
                command: packageManager,
                args: getInstallArgs(packageManager, 'path'),
            },
        );
    }

    if (answers.stateManagement) {
        commands.push(
            {
                name: 'Redux',
                command: packageManager,
                args: getInstallArgs(packageManager, 'redux', 'react-redux'),
            },
            {
                name: 'Redux Toolkit',
                command: packageManager,
                args: getInstallArgs(packageManager, '@reduxjs/toolkit'),
            }
        );
    }

    if (answers.zustand) {
        commands.push({
            name: 'Zustand',
            command: packageManager,
            args: getInstallArgs(packageManager, 'zustand'),
        });
    }

    if (answers.lodash) {
        commands.push(
            {
                name: 'lodash (global)',
                command: packageManager,
                args: getInstallArgs(packageManager, 'lodash', false, true),
            },
            {
                name: 'lodash (local)',
                command: packageManager,
                args: getInstallArgs(packageManager, 'lodash'),
            },
        );
    }

    if (answers.reactQuery) {
        commands.push({
            name: 'react-query',
            command: packageManager,
            args: getInstallArgs(packageManager, 'react-query'),
        });
    }

    if (answers.uiFramework === 'Material UI') {
        commands.push(
            {
                name: '@mui/material',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/material'),
            },
            {
                name: '@emotion/react',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/react'),
            },
            {
                name: '@emotion/styled',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/styled'),
            },
            {
                name: '@mui/icons-material',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/icons-material'),
            },
            {
                name: '@mui/x-date-pickers',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/x-date-pickers'),
            },
            {
                name: 'dayjs',
                command: packageManager,
                args: getInstallArgs(packageManager, 'dayjs'),
            },
        );
    }

    if (answers.uiFramework === 'Joy UI') {
        commands.push(
            {
                name: '@mui/joy',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/joy'),
            },
            {
                name: '@emotion/react',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/react'),
            },
            {
                name: '@emotion/styled',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/styled'),
            },
            {
                name: '@mui/icons-material',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/icons-material'),
            },
            {
                name: '@mui/x-date-pickers',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/x-date-pickers'),
            },
            {
                name: 'dayjs',
                command: packageManager,
                args: getInstallArgs(packageManager, 'dayjs'),
            },
        );
    }

    if (answers.uiFramework === 'both') {
        commands.push(
            {
                name: '@mui/material',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/material'),
            },
            {
                name: '@mui/joy',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/joy'),
            },
            {
                name: '@emotion/react',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/react'),
            },
            {
                name: '@emotion/styled',
                command: packageManager,
                args: getInstallArgs(packageManager, '@emotion/styled'),
            },
            {
                name: '@mui/icons-material',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/icons-material'),
            },
            {
                name: '@mui/x-date-pickers',
                command: packageManager,
                args: getInstallArgs(packageManager, '@mui/x-date-pickers'),
            },
        );
    }

    for (const command of commands) {
        await installingDependencies(command, answers.projectName);
    }
}
const isCommandAvailable = (command) => {
    return new Promise((resolve) => {
        const platform = process.platform;
        const checkCommand = platform === 'win32' ? `where ${command}` : `which ${command}`;
        const child = spawn(checkCommand, {
            shell: true,
            stdio: 'ignore',
        });

        child.on('error', () => resolve(false));
        child.on('exit', (code) => resolve(code === 0));
    });
};
// Helper function to get the install arguments based on the package manager
const getInstallArgs = (packageManager, ...packages) => {
    switch (packageManager) {
        case 'yarn':
            return ['add', ...packages];
        case 'pnpm':
            return ['add', ...packages];
        case 'npm':
            return ['install', ...packages];
    }
}

const installingDependencies = async (command, directory) => {
    return new Promise((resolve, reject) => {
        const loader = startLoader(`Installing ${command.name}... \n`).start();
        const child = spawn(command.command, command.args, {
            cwd: path.join(process.cwd(), directory)
        });
        child.on('close', (code) => {
            clearInterval(loaderColorIntervalInstance);
            if (code === 0) {
                resolve();
                loader.succeed(chalk.green(`${command.name} installed successfully!`));
            } else {
                reject();
                loader.fail(chalk.red(`Command failed with exit code ${code}`));
            }
        });
    })
}
const createProjectStructure = async (answers) => {
    const destinationPath = path.join(process.cwd(), answers.projectName);
    const srcPath = path.join(destinationPath, 'src');
    try {
        console.log(chalk.cyan(`Creating folders and files...`));
        // Ensure the Vite project has been created
        if (!fs.existsSync(destinationPath)) {
            console.log(chalk.red(`Project directory ${destinationPath} does not exist. Something went wrong.`));
            return;
        }

        // If src directory exists, append files and folders; otherwise, copy everything
        if (fs.existsSync(srcPath)) {
            console.log(chalk.yellow(`⚠️  src directory already exists. Appending files and folders...`));
        } else {
            console.log(chalk.cyan('src directory does not exist. Copying template...'));
            const templateDir = path.join(__dirname, 'template');
            fse.copySync(templateDir, destinationPath, { overwrite: false, errorOnExist: false });
        }
        // Update or create config files inside the src directory
        await updateConfigFiles(answers);
        await executeCommandForDependencies(answers);
        console.log(chalk.cyan(`cd ${answers.projectName}`));
        console.log(chalk.cyan('npm run dev'));
        console.log(gradient.atlas.multiline('Hey hacker your project is ready for development :)\n'));
    } catch (e) {
        console.log(chalk.red(e), "============");
    }
};
const executeCommand = (answers) => {
    const destinationPath = path.join(process.cwd(), answers.projectName);
    const loader = startLoader('Setting up Vite project... \n').start();
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
    }
    // Determine the template and SWC option
    const languageTemplateMap = {
        'JavaScript': 'react',
        'JavaScript + SWC': 'react',
        'TypeScript': 'react-ts',
        'TypeScript + SWC': 'react-ts',
    };
    const template = languageTemplateMap[answers.language];
    const swcFlag = answers.language.includes('SWC') ? '--swc' : '';
    const child = spawn('npm', ['create', 'vite@latest', answers?.projectName, '--', '--template', template, swcFlag].filter(Boolean), {
        stdio: 'inherit',
        shell: true,
    });


    child.on('close', (code) => {

        clearInterval(loaderColorIntervalInstance);
        if (code === 0) {

            loader.succeed(chalk.green('React JS project setup complete!'));
            createProjectStructure(answers);
        } else {
            loader.fail(chalk.red(`Command failed with exit code ${code}`));
        }
    });

    child.on('error', (err) => {
        loader.fail(chalk.red(`Failed to start command: ${err.message}`));
    });
    console.log("not working");

}

const askQuestions = async () => {
    const questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter Project Name:',
            default: 'my-app',
        },
        {
            type: 'list',
            name: 'language',
            message: 'Select one:',
            choices: [
                'JavaScript',
                'JavaScript + SWC',
                'TypeScript',
                'TypeScript + SWC'
            ],
        },
        {
            type: 'list',
            name: 'uiFramework',
            message: 'Select one:',
            choices: [
                'Material UI',
                'Joy UI',
                'both',
            ],
        },
        {
            type: 'confirm',
            name: 'stateManagement',
            message: 'Would you like to add Redux for state management?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'zustand',
            message: 'Would you like to add Zustand for state management?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'jwtDecoder',
            message: 'Would you like to add jwt-decoder?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'reactQuery',
            message: 'Would you like to add React Query?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'lodash',
            message: 'Would you like to add lodash?',
            default: false,
        },
        {
            type: 'list',
            name: 'packageManager',
            message: 'Which package manager would you like to use?',
            choices: [
                'npm',
                'yarn',
                'pnpm'
            ],
            default: 'npm'
        }

    ];
    try {
        const answers = await inquirer.prompt(questions);
        // Check if the selected package manager is installed
        const isAvailable = await isCommandAvailable(answers?.packageManager);
        if (!isAvailable) {
            console.log(chalk.red(`The package manager ${answers?.packageManager} is not installed on your system.`));
            if (answers?.packageManager === 'pnpm') {
                console.log(chalk.blueBright(`Please install pnpm using the following command:`));
                console.log(chalk.green(`npm install -g pnpm`));
            } else if (answers?.packageManager === 'npm') {
                console.log(chalk.blueBright(`Please install npm using one of the following commands:`));
                console.log(chalk.green(`To install npm globally (if not available):`));
                console.log(chalk.green(`curl -L https://www.npmjs.com/install.sh | sh`)); // for Unix-like systems
                console.log(chalk.green(`npm install -g npm`)); // for upgrading npm
                console.log(chalk.green(`To install Yarn:`));
                console.log(chalk.green(`npm install -g yarn`));
                console.log(chalk.green(`To install pnpm:`));
                console.log(chalk.green(`npm install -g pnpm`));
            } else if (answers?.packageManager === 'yarn') {
                console.log(chalk.blueBright(`Please install Yarn using one of the following commands:`));
                console.log(chalk.green(`To install Yarn globally:`));
                console.log(chalk.green(`npm install -g yarn`));
                console.log(chalk.green(`To install npm:`));
                console.log(chalk.green(`npm install -g npm`)); // or alternative methods to install npm
                console.log(chalk.green(`To install pnpm:`));
                console.log(chalk.green(`npm install -g pnpm`));
            }

            return
        }
        executeCommand(answers)
    } catch (e) {
        console.log(e)
    }
}
const entryPoint = async () => {

    try {
        console.log(chalk.blue('Welcome To react setup process'));
        askQuestions();

    } catch (e) {
        console.log('something went wrong!');
    }

};
//yes
entryPoint();
