<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import type { PropType, ComputedRef } from 'vue';
import { KeyChecker, KeyType } from '@this-oliver/ssasy';
import { useKeyStore } from '~/common/stores/key-store';
import type { GenericKey, RawKey } from '@this-oliver/ssasy';
import BaseCard from '~/components/Base/BaseCard.vue';
import type { ActionItem } from '~/components/Base/BaseCard.vue';

const MSG_MISSING_VALUE = 'N/A';

const keyStore = useKeyStore();

const props = defineProps({
  ssasyKey: {
    type: Object as PropType<GenericKey | RawKey>,
    required: true
  },
  showSecrets: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const data = reactive({
  rawKey: undefined as RawKey | undefined,
  keySummary: [] as KeyDetail[],
  keySpecifications: [] as KeyDetail[]
})

const KeyTypeName: ComputedRef<string> = computed(() => {
  const SYMMETRIC = 'Symmetric';
  const ASYMMETRIC = 'Asymmetric';
  
  switch (props.ssasyKey.type) {
  case KeyType.SecretKey:
    return SYMMETRIC;
  case KeyType.PassKey:
    return `Password-based ${SYMMETRIC}`;
  case KeyType.PrivateKey:
    return `Private ${ASYMMETRIC}`;
  case KeyType.PublicKey:
    return `Public ${ASYMMETRIC}`;
  case KeyType.SharedKey:
    return `Shared (ECDH) ${SYMMETRIC}`;
  default:
    return 'Unknown';
  }
})

const keyActions: ComputedRef<ActionItem[]> = computed(() => {
  const actions: ActionItem[] = [];
  
  if(props.showActions || props.showSecrets){
    actions.push({
      label: 'Export',
      color: 'primary',
      disabled: data.rawKey === undefined,
      action: () => {
        if(data.rawKey){
          const jsonKey = JSON.stringify(data.rawKey);

          // create a json file
          const blob = new Blob([ jsonKey ], { type: 'application/json' });

          // create link to download
          const url = URL.createObjectURL(blob);
          
          // create a download anchor node
          let downloadAnchorNode = document.createElement('a');
          // set the href to the blob url
          downloadAnchorNode.setAttribute('href', url);
          // set the download attribute to the file name
          downloadAnchorNode.setAttribute('download', 'ssasy-key.json');

          // trigger the download by appending the anchor node to the body
          document.body.appendChild(downloadAnchorNode); // required for firefox
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          
        }
      }
    });
  }
  return actions;
})

interface KeyDetail{
  label: string;
  value: string;
}
function extractKeySummary(rawKey: RawKey): KeyDetail[]{
  const details: KeyDetail[] = [];
  const MSG_MISSING_VALUE = 'N/A';

  const isAsymmetric = rawKey.type === KeyType.PrivateKey || rawKey.type === KeyType.PublicKey;
  
  details.push({ label: 'Algorithm', value: isAsymmetric ? `${rawKey.crypto.kty} ${rawKey.crypto.crv}` : rawKey.crypto.alg || MSG_MISSING_VALUE });
  details.push({ label: 'Usages', value: rawKey.crypto.key_ops?.join(', ') || MSG_MISSING_VALUE });
  //details.push({ label: 'Extractable', value: rawKey.crypto.ext || MSG_MISSING_VALUE });
  details.push({ label: 'Domain', value: rawKey.domain || MSG_MISSING_VALUE });
  return details;
}
function extractKeySpecification(rawKey: RawKey): KeyDetail[]{
  const details: KeyDetail[] = [];
  
  if(props.showSecrets && rawKey){
    const isSymmetric = props.ssasyKey.type === KeyType.SecretKey || props.ssasyKey.type === KeyType.SharedKey;
    
    if(isSymmetric){
      details.push({ label: 'K-value', value: rawKey.crypto.k?.toString() || MSG_MISSING_VALUE });

      if(props.ssasyKey.type === KeyType.PassKey){
        details.push({ label: 'Salt', value: rawKey.salt?.toString() || MSG_MISSING_VALUE });
        details.push({ label: 'Hash', value: rawKey.hash || MSG_MISSING_VALUE });
        details.push({ label: 'Itterations', value: rawKey.iterations?.toString() || MSG_MISSING_VALUE });
      }
    } else {
      details.push({ label: 'Curve', value: rawKey.crypto.crv || MSG_MISSING_VALUE });
      details.push({ label: 'D-value', value: rawKey.crypto.d || MSG_MISSING_VALUE });
      details.push({ label: 'X-value', value: rawKey.crypto.x || MSG_MISSING_VALUE });
      details.push({ label: 'Y-value', value: rawKey.crypto.y || MSG_MISSING_VALUE });
    }
  }
  return details;
}

onMounted(async () => {
  data.rawKey = KeyChecker.isRawKey(props.ssasyKey) 
    ? props.ssasyKey  as RawKey
    : await keyStore.exportKey(props.ssasyKey);

  if(data.rawKey !== undefined){
    data.keySummary = extractKeySummary(data.rawKey);
    data.keySpecifications = extractKeySpecification(data.rawKey);
  }
})
</script>

<template>
  <base-card
    :actions="keyActions"
    class="pa-1">
    <v-card-title>{{ KeyTypeName }} Key</v-card-title>
    <v-card-text>
      <v-list lines="one">
        <v-list-item 
          v-for="detail in data.keySummary" 
          :key="detail.label" 
          :title="detail.label" 
          :subtitle="detail.value" />
      </v-list>
    </v-card-text>

    <div
      v-if="props.showSecrets"
      class="json-string mt-2">
      <pre><code>{{ data.rawKey }}</code></pre>
    </div>
  </base-card>
</template>

<style>
.json-string {
  overflow: auto;
}
</style>