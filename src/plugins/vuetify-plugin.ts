import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as icons from '@mdi/js'

import type { ThemeDefinition } from 'vuetify'

export const AppTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#7C17D1',
    secondary: '#FF4081',
    accent: '#5E0E94',
    error: '#D50000',
    warning: '#FF6D00',
    info: '#00B8D4',
    success: '#00C853',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF'
  }
}

export const AppThemeDark: ThemeDefinition = {
  dark: true,
  colors:{
    primary: '#7C17D1',
    secondary: '#FF4081',
    accent: '#5E0E94',
    error: '#D50000',
    warning: '#FF6D00',
    info: '#00B8D4',
    success: '#00C853',
    background: '#121212',
    surface: '#1E1E1E',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onError: '#FFFFFF'
  }
}

function getProcessedIcons(icons: any){
  const processedIcons: any = {};

  for (const key in icons) {
    // convert from PascalCase to kebab-case
    const kebabCaseKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()

    processedIcons[kebabCaseKey] = icons[key]
  }

  return processedIcons
}

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
    aliases: {
      ...aliases,
      ...getProcessedIcons(icons)
    },
    sets: {
      mdi
    }
  }
})