import { create } from 'zustand'

export const useCallStore = create((set) => ({
  // Pre-call state
  selectedScenario: null,
  selectedMode: 'medium',
  selectedLanguage: localStorage.getItem('seez_language') || 'english',

  // Active call
  callId: null,
  retellCallId: null,
  retellAccessToken: null,
  isCallActive: false,
  callStartTime: null,
  hintsUsed: 0,
  hintsLimit: 3,
  liveTranscript: [],

  // Post-call
  evalResult: null,

  setScenario: (scenario) => set({ selectedScenario: scenario }),
  setMode: (mode) => {
    const limits = { easy: Infinity, medium: 3, hard: 0 }
    set({ selectedMode: mode, hintsLimit: limits[mode] })
  },
  setLanguage: (language) => {
    localStorage.setItem('seez_language', language)
    set({ selectedLanguage: language })
  },

  startCall: (callId, retellCallId, retellAccessToken) =>
    set({
      callId,
      retellCallId,
      retellAccessToken,
      isCallActive: true,
      callStartTime: Date.now(),
      hintsUsed: 0,
    }),

  useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),
  setLiveTranscript: (transcript) => set({ liveTranscript: transcript }),

  endCall: (evalResult) =>
    set({
      isCallActive: false,
      retellAccessToken: null,
      liveTranscript: [],
      evalResult,
    }),

  reset: () =>
    set({
      callId: null,
      retellCallId: null,
      retellAccessToken: null,
      isCallActive: false,
      callStartTime: null,
      hintsUsed: 0,
      liveTranscript: [],
      evalResult: null,
    }),
}))
