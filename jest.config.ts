module.exports = {
    preset: 'ts-jest', // Ensures Jest works with TypeScript
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',  // Use ts-jest to transform TypeScript files
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transformIgnorePatterns: ['node_modules/(?!supertest)'], // Allows Jest to transpile dependencies using ESM
  };
  