import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { AppTheme, AppThemeDark } from '../utils/theme'

export default createVuetify({
  components: {
    ...components,
    VSkeletonLoader
  },
  directives,
  theme: {
    defaultTheme: 'AppTheme', // other options are 'light' or 'dark'
    themes: {
      AppTheme,
      AppThemeDark
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})