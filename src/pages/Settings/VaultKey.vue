<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useVaultStore, useSessionStore, useNotificationStore } from '~/stores';
import BasePage from '~/components/base/BasePage.vue';
import BaseCard from '~/components/base/BaseCard.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';

const router = useRouter();
const vaultStore = useVaultStore();
const sessionStore = useSessionStore();
const notificationStore = useNotificationStore();

const consequences: string[] = [
  'Your encrypted private key will be deleted.',
  'You will permanently loose access to services that require the vault key if you have not exported/backed up your private key.'
];

async function deleteVaultKey () {
  vaultStore.resetVault();
  sessionStore.resetSession();

  notificationStore.notify('Settings', 'Vault key deleted.');

  router.push('/');
}

function cancelKeyDeletion () {
  router.go(-1);
}

</script>

<template>
  <base-page title="Deleting encrypted vault key">
    <v-row justify="center">
      <v-col
        cols="11"
        md="6">
        <base-card>
          <v-card-title>
            Delete encrypted vault key
          </v-card-title>

          <v-card-text>
            This action has the following consequences:
            <v-list>
              <v-list-item
                v-for="consequence, index in consequences"
                :key="consequence">
                {{index+1}}. {{ consequence }}
              </v-list-item>
            </v-list>

            <br>

            <p>
              Are you sure you want to delete your encrypted vault key? This action cannot be undone.
            </p>
          </v-card-text>

          <v-card-actions>
            <base-btn
              color="error"
              @click="cancelKeyDeletion">Cancel</base-btn>
            <base-btn
              text
              color="grey lighten-1"
              @click="deleteVaultKey">Delete</base-btn>
          </v-card-actions>
        </base-card>
      </v-col>
    </v-row>
  </base-page>
</template>