import { black, green, red, white, pink, dark } from './colors'

export enum Themes {
  DARK_MODE = 'darkmode',
  LIGHT_MODE = 'lightmode'
}

const theme = {
  borderRadius: 12,
  color: pink,
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
  topBarSize: 72,
  gradient: 'linear-gradient(#39598A, #79D7ED)'
}

export const lightmode = {
  ...theme,
  color: pink,
  gradient: 'linear-gradient(#39598A, #79D7ED)'
}

export const darkmode = {
  ...theme,
  color: dark,
  gradient: 'linear-gradient(#091236, #1E215D)',
}

const ThemeMap = { darkmode, lightmode }
export default ThemeMap