import { black, green, red, white, grey } from './colors'

export enum Themes {
  DARK_MODE = 'darkmode',
  LIGHT_MODE = 'lightmode'
}

const theme = {
  borderRadius: 12,
  color: {
    black,
    grey,
    primary: {
      light: red[200],
      main: red[500],
    },
    secondary: {
      main: green[500],
    },
    white,
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72
}

export const lightmode = {
  ...theme,
  color: {
    black,
    grey,
    primary: {
      light: red[200],
      main: red[500],
    },
    secondary: {
      main: green[500],
    },
    white,
  },
}

export const darkmode = {
  ...theme,
  color: {
    black,
    grey,
    primary: {
      light: grey[200],
      main: grey[500],
    },
    secondary: {
      main: green[500],
    },
    white,
  },
}

const themeMap = { darkmode, lightmode }
export default themeMap