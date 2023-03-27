<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '~/common/stores';
import BasePage from '~/components/Base/BasePage.vue';

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);

function getHumanReadableTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
}
</script>

<template>
  <base-page title="Extension Logs">
    <v-row justify="center">
      <v-col
        v-for="notification, index in notifications"
        :key="notification.title + index"
        cols="11"
        md="7">
        <BaseCard :color="notification.type === 'info' ? 'primary' : 'error'">
          <small class="mt-2 ml-1 pa-2">{{ getHumanReadableTime(notification.timestamp) }}</small>
          <v-card-title>
            {{ notification.title }} <span v-if="notification.type === 'error'">- Error</span>
          </v-card-title>
          <v-card-text>
            {{ notification.message }}
          </v-card-text>
        </BaseCard>
      </v-col>

      <v-col
        v-if="notifications.length === 0"
        cols="11"
        md="7">
        <BaseCard>
          <v-card-title>
            <h3>Logs are empty</h3>
          </v-card-title>
          <v-card-text>
            <p>There are no logs to display at this time.</p>
            <br/>
            <i>Note: Play around with the extension and come back to see what's going on under the hood.</i>
          </v-card-text>
        </BaseCard>
      </v-col>
    </v-row>
  </base-page>
</template>