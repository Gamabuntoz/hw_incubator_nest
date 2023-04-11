export const jwtConstants = {
  secretAccessKey: process.env.JWT_ACCESS_TOKEN_SECRET || 'verySecretKey',
  secretRefreshKey: process.env.JWT_REFRESH_TOKEN_SECRET || 'verySecretKey',
};

export const basicConstants = {
  adminName: process.env.SA_LOGIN || 'admin',
  adminPass: process.env.SA_PASS || 'qwerty',
};
