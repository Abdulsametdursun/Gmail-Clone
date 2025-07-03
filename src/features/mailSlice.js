import { createSlice } from '@reduxjs/toolkit';

export const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    selectedMail: null,
    sendMessageIsOpen: false,
    draft: null,
  },
  reducers: {
    selectMail: (state, action) => {
      state.selectedMail = action.payload;
    },
    openSendMessage: (state) => {
      state.sendMessageIsOpen = true;
    },
    closeSendMessage: (state) => {
      state.sendMessageIsOpen = false;
      state.draft = null;
    },
    setDraft: (state, action) => {
      state.draft = action.payload;
    },
    clearDraft: (state) => {
      state.draft = null;
    },
  },
});

export const { selectMail, openSendMessage, closeSendMessage, setDraft, clearDraft } =
  mailSlice.actions;

export const selectOpenMail = (state) => state.mail.selectedMail;
export const selectSendMessageIsOpen = (state) => state.mail.sendMessageIsOpen;
export const selectDraft = (state) => state.mail.draft;

export default mailSlice.reducer;
