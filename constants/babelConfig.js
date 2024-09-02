const  babelConfig = {
    plugins: [
        [
            'module-resolver',
            {
                root: ['./'],
                alias: {
                    '@constants': './src/constants',
                    '@assets': './src/assets',
                    '@helpers': './src/helpers',
                    '@screens': './src/screens',
                },
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
            },
        ],
    ],
};

export default babelConfig;