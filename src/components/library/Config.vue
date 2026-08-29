<template>
  <BaseModal
    :title="$t('config.title')"
    @beforeOpen="beforeOpenHandler"
    @close="emit('close')"
    body-class="flex flex-col h-full justify-between overflow-y-auto"
  >
    <div class="flex flex-col gap-8">
      <div>
        <label class="group-label mb-4">{{ $t('config.common') }}</label>

        <div class="flex flex-col mb-4">
          <label class="block mb-2 child-label">{{ $t('config.downloadLyricsFor') }}</label>
          <RadioButton class="mb-1" v-model="downloadLyricsFor" name="download-lyrics-for" id="download-lyrics-for-all" value="all">{{ $t('config.allSongs') }}</RadioButton>
          <RadioButton class="mb-1" v-model="downloadLyricsFor" name="download-lyrics-for" id="skip-synced" value="skipSynced">{{ $t('config.withoutSynced') }}</RadioButton>
          <RadioButton class="mb-1" v-model="downloadLyricsFor" name="download-lyrics-for" id="skip-plain" value="skipPlain">{{ $t('config.withoutPlainOrSynced') }}</RadioButton>
        </div>

        <div class="flex flex-col mb-4">
          <label class="block mb-2 child-label">{{ $t('config.searchSettings') }}</label>
          <CheckboxButton v-model="showLineCount" name="show-line-count" id="show-line-count">{{ $t('config.showLineCount') }}</CheckboxButton>
        </div>

        <div class="flex flex-col mb-4">
          <label class="block mb-2 child-label">{{ $t('config.themeMode') }}</label>
          <div class="flex gap-4">
            <RadioButton v-model="editingThemeMode" name="theme-mode" id="theme-auto" value="auto">{{ $t('config.auto') }}</RadioButton>
            <RadioButton v-model="editingThemeMode" name="theme-mode" id="theme-light" value="light">{{ $t('config.light') }}</RadioButton>
            <RadioButton v-model="editingThemeMode" name="theme-mode" id="theme-dark" value="dark">{{ $t('config.dark') }}</RadioButton>
          </div>
        </div>

        <div class="flex flex-col">
          <label class="block mb-2 child-label" for="lrclib-instance">{{ $t('config.lrclibInstance') }}</label>
          <input id="lrclib-instance" type="text" v-model="editingLrclibInstance" placeholder="https://" class="input px-4 h-8">
        </div>
      </div>

      <div>
        <label class="group-label mb-4">{{ $t('config.experimental') }}</label>
        <div class="flex items-start">
          <CheckboxButton v-model="tryEmbedLyrics" name="try-embed-lyrics" id="try-embed-lyrics">
            <div class="flex flex-col">
              <span class="mb-0.5">{{ $t('config.embedLyrics') }}</span>
              <span class="text-xs text-yellow-700 dark:text-yellow-400">{{ $t('config.embedWarning') }}</span>
            </div>
          </CheckboxButton>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <a href="#" class="link" @click="refreshLibrary">{{ $t('config.refreshLibrary') }}</a>
        <a href="#" class="link" @click="uninitializeLibrary">{{ $t('config.manageDirectories') }}</a>
      </div>
    </div>

    <template #footer>
      <button class="button button-primary px-8 py-2 rounded-full" @click="save">{{ $t('config.save') }}</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { invoke } from '@tauri-apps/api/core'
import { ref, watch } from 'vue'
import { useGlobalState } from '../../composables/global-state'
import RadioButton from '@/components/common/RadioButton.vue'
import CheckboxButton from '@/components/common/CheckboxButton.vue'

const { setThemeMode, setLrclibInstance } = useGlobalState()
const emit = defineEmits(['close', 'refreshLibrary', 'uninitializeLibrary'])
const downloadLyricsFor = ref('all')
const skipTracksWithSyncedLyrics = ref(true)
const skipTracksWithPlainLyrics = ref(false)
const showLineCount = ref(true)
const tryEmbedLyrics = ref(false)
const editingThemeMode = ref('auto')
const editingLrclibInstance = ref('')

const save = async () => {
  await invoke('set_config', {
    skipTracksWithSyncedLyrics: skipTracksWithSyncedLyrics.value,
    skipTracksWithPlainLyrics: skipTracksWithPlainLyrics.value,
    showLineCount: showLineCount.value,
    tryEmbedLyrics: tryEmbedLyrics.value,
    themeMode: editingThemeMode.value,
    lrclibInstance: editingLrclibInstance.value
  })
  setThemeMode(editingThemeMode.value)
  setLrclibInstance(editingLrclibInstance.value)
  emit('close')
}

const refreshLibrary = () => { emit('refreshLibrary'); emit('close') }
const uninitializeLibrary = () => { emit('uninitializeLibrary'); emit('close') }

const beforeOpenHandler = async () => {
  const config = await invoke('get_config')
  skipTracksWithSyncedLyrics.value = config.skip_tracks_with_synced_lyrics
  skipTracksWithPlainLyrics.value = config.skip_tracks_with_plain_lyrics
  if (skipTracksWithSyncedLyrics.value && !skipTracksWithPlainLyrics.value) downloadLyricsFor.value = 'skipSynced'
  else if (skipTracksWithPlainLyrics.value) downloadLyricsFor.value = 'skipPlain'
  else downloadLyricsFor.value = 'all'
  showLineCount.value = config.show_line_count
  tryEmbedLyrics.value = config.try_embed_lyrics
  editingThemeMode.value = config.theme_mode
  editingLrclibInstance.value = config.lrclib_instance
}

watch(downloadLyricsFor, (newVal) => {
  if (newVal === 'skipSynced') {
    skipTracksWithSyncedLyrics.value = true
    skipTracksWithPlainLyrics.value = false
  } else if (newVal === 'skipPlain') {
    skipTracksWithSyncedLyrics.value = true
    skipTracksWithPlainLyrics.value = true
  } else {
    skipTracksWithSyncedLyrics.value = false
    skipTracksWithPlainLyrics.value = false
  }
})
</script>
