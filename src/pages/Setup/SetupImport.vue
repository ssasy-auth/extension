<!-- generate key or import -->
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { KeyChecker, CryptoChecker, CryptoModule } from '@ssasy-auth/core';
import { useKeyStore } from '~/stores/key-store';
import { useNotificationStore } from '~/stores/app';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';
import InfoCard from '~/components/Info/InfoCard.vue';
import InputFile from '~/components/Base/InputFile.vue';
import InputTextArea from '~/components/Base/InputTextArea.vue';
import InputText from '~/components/Base/InputText.vue';
import KeyCard from '~/components/Key/KeyCard.vue';
import { KeyType } from '@ssasy-auth/core';
import type { Ciphertext, GenericKey, PrivateKey, RawKey } from '@ssasy-auth/core';

const notificationStore = useNotificationStore();
const keyStore = useKeyStore();

const formFiles = ref<File[]>([]);
const formText = ref<string | undefined>(undefined);

const requestPassword = ref(false);
const password = ref<string | undefined>(undefined);

const data = reactive({
  rawKey: undefined as RawKey | undefined,
  privateKey: undefined as PrivateKey | undefined
})

/**
 * Returns true if the private key is valid
 */
const isValidKey = computed(() => {
  if(!data.privateKey){
    return false;
  }

  return KeyChecker.isKey(data.privateKey);
});

/**
 * Returns true if the file is valid
 */
const isValidFile = computed(() => {
  if(
    formFiles.value === undefined ||
    formFiles.value.length === 0
  ){
    return false;
  }

  const file = formFiles.value[0];

  if(file instanceof Blob === false){
    notificationStore.error('Setup Import Flow', 'Invalid file', { toast: true });
    return false;
  }

  if(file.type !== 'application/json'){
    notificationStore.error('Setup Import Flow', 'Invalid json file type', { toast: true });
    return false;
  }

  return true;
});

/**
 * Returns true if the text is valid
 */
const isValidText = computed(() => {
  const value = formText.value;

  if(value === undefined){
    return false;
  }

  if(typeof value !== 'string'){
    return false;
  }

  if(value.trim().length === 0){
    return false;
  }
  
  return true;
});

/**
 * Returns string of user input
 */
async function _getInput(input: string | Blob[]): Promise<string>{
  if(
    !isValidText.value && // if text is not valid
    !isValidFile.value // and file is not valid
  ){
    throw new Error('Invalid input');
  }

  if(typeof input === 'string'){
    return input;
  }

  const file = formFiles.value![0];

  // extract file contents
  return await file.text();
}

/**
 * Converts input to raw key
 */
async function _stringToRawKey(content: string): Promise<RawKey>{
  
  let key: RawKey = JSON.parse(content);

  // throw error if not a raw key
  if(!KeyChecker.isRawKey(key as GenericKey)){
    throw new Error('Not a valid raw key');
  }

  // throw error if not a private key
  if(key.type !== KeyType.PrivateKey){
    throw new Error('Not a private key');
  }

  return key;
}

/**
 * Sets the raw key and private key
 */
async function importKey(){
  const input = await _getInput(formText.value || formFiles.value);

  try {
    if(input === undefined){
      throw new Error('Input is undefined');
    }

    let rawKey: RawKey;

    if(requestPassword.value === true){
      if(password.value === undefined){
        throw new Error('File provided is encrypted. Please provide a valid password to continue');
      }

      const ciphertext = JSON.parse(input) as Ciphertext;

      if(!CryptoChecker.isCiphertext(ciphertext)){
        throw new Error('Invalid ciphertext');
      }

      // decrypt raw key
      const plaintext = await CryptoModule.decrypt(password.value, ciphertext)
      rawKey = JSON.parse(plaintext) as RawKey;
      
    } else {
      rawKey = await _stringToRawKey(input);
    }

    if(requestPassword.value === true && password.value === undefined){
      throw new Error('Password is undefined');
    }
    
    // set component raw key
    data.rawKey = rawKey;

    // convert raw key to private key
    const privateKey = await keyStore.importKey(rawKey) as PrivateKey;
    
    // set component private key
    data.privateKey = privateKey;

    // set key store temporary key
    keyStore.temporaryKey = privateKey;

  } catch (error) {
    const message = (error as Error).message || 'Failed to convert file to key';
    notificationStore.error('Setup Import Flow', message, { toast: true });
  }
}

// watch for file changes
watch(formFiles, async (files) => {
  const content: string = await _getInput(files);
  const isCiphertext = CryptoChecker.isCiphertext(JSON.parse(content));

  if(isCiphertext){
    requestPassword.value = true;
  }
});
</script>

<template>
  <base-page title="Import Key">
    <v-row
      v-if="!isValidKey"
      justify="center"
      no-gutters>
      <v-col
        cols="10"
        md="6">
        <info-card>
          <p>
            There are two ways to import a key. You can either copy/paste the key into the text area below,
            or you can upload a JSON file containing the key.
          </p>
        </info-card>
      </v-col>
      <v-divider />
      <v-col
        cols="10"
        md="6"
        class="mt-2">
        
        <base-card
          class="my-1"
          :outlined="false">
          <input-text-area
            v-model="formText"
            label="Paste Key" />
        </base-card>
        
        <div class="text-center">
          <i>or</i>
        </div>
        
        <base-card
          class="my-1"
          :tonal="requestPassword"
          :outlined="false">
          
          <input-file
            v-model="formFiles"
            label="Upload JSON File"/>

          <input-text
            v-if="requestPassword"
            v-model="password"
            label="Password"
            type="password" />

          <info-card v-if="requestPassword">
            <p>
              The file you uploaded is encrypted. Please provide the password to continue.
            </p>
          </info-card>

          <div class="text-center mt-2">
            <base-btn
              v-if="requestPassword"
              :disabled="!password"
              @click="importKey">
              Decrypt File
            </base-btn>
          </div>

        </base-card>
      </v-col>

      <v-divider />

      <v-col
        v-if="!requestPassword"
        cols="auto"
        class="mt-2">
        <base-btn
          :disabled="!formText && !formFiles"
          @click="importKey">
          Import
        </base-btn>
      </v-col>
    </v-row>
    
    <v-row
      v-else
      justify="center">
      <v-col
        cols="10"
        md="6">
        <key-card
          :ssasy-key="data.privateKey!"
          :show-secrets="true" />
      </v-col>
    </v-row>
    <v-row
      v-if="isValidKey"
      justify="center">
      <v-col cols="auto">
        <base-btn to="/setup">
          Back
        </base-btn>
      </v-col>
      <v-col cols="auto">
        <base-btn to="/setup/storage">
          Next
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>
