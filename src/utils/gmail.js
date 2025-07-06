export const listInboxMessages = async () => {
  const response = await window.gapi.client.gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    maxResults: 20,
  });

  return response.result.messages || [];
};

export const getMessageDetails = async (messageId) => {
  const response = await window.gapi.client.gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });

  return response.result;
};
