const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/backend'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      externalDependencies: 'none',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp:
        /^(class-validator|class-transformer|@nestjs\/websockets\/socket-module|@nestjs\/microservices\/microservices-module|@nestjs\/microservices|@nestjs\/websockets|react-native-sqlite-storage|@google-cloud\/spanner|mongodb|@sap\/hana-client|mysql$|oracledb|pg$|pg-native|pg-query-stream|typeorm-aurora-data-api-driver|redis$|ioredis|better-sqlite3|sqlite3|sql\.js|mssql)$/,
    }),
  ],
};
