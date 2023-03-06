<script setup lang="ts">
import BasePage from "@/components/Base/BasePage.vue";
import BaseBtn from "@/components/Base/BaseBtn.vue";


</script>

<template>
  <base-page>
    <v-row justify="center" no-gutters>
      <v-col cols="10">
        <blockquote>
          <p>
            SSASy is an authenticator that helps users manage their self-sovereign authentication schemes in a simple and secure manner.
          </p>
        </blockquote>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <base-btn :large="true" to="/setup">Get Started</base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>