import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const AppTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#3D58F2',
    secondary: '#09030D',
    warning: '#F2B705',
    error: '#F25E3D'
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'AppTheme', // other options are 'light' or 'dark'
    themes: {
      AppTheme
    }
  }
})