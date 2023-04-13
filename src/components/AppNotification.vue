<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <toaster
    expand
    :visibleToasts="2"
    position="bottom-center"/>
</template>