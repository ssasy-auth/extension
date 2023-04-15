<script setup lang="ts">
import InfoCard from './InfoCard.vue';
</script>

<template>
  <info-card color="warning">
    <b>Never share your private key with anyone!</b>
    <p>If anyone gets a hold of your private key, they can impersonate you on any service you have registered with. Therefore, never share your private key with anyone even if they claim to be a developer of this extension or a service you have registered with.</p>
    <br>
    <p>If you feel like your private key has been compromised, you should immediately revoke your private key, generate a new one, and inform all services you have registered with.</p>
  </info-card>
</template>