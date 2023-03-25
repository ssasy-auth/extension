import { type ThemeDefinition } from 'vuetify'

export const AppTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#3D58F2',
    secondary: '#09030D',
    warning: '#F2B705',
    error: '#F25E3D'
  }
}

export const AppThemeDark: ThemeDefinition = {
  dark: true,
  ...AppTheme.colors
}