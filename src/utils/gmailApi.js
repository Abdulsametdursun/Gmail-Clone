export const fetchGmailMessages = async () => {
  try {
    const user = gapi.auth2.getAuthInstance().currentUser.get();

    if (!user.isSignedIn()) {
      throw new Error('User not signed in');
    }

    const token = user.getAuthResponse().access_token;

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gmail fetch error:', data);
      throw new Error(data.error.message);
    }

    const messageIds = data.messages || [];

    const messages = await Promise.all(
      messageIds.map(async ({ id }) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const msg = await msgResponse.json();
        const headers = msg.payload.headers;
        const getHeader = (name) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: msg.id,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          message: msg.snippet,
          timestamp: new Date(parseInt(msg.internalDate)),
          folder: 'inbox',
          read: !msg.labelIds.includes('UNREAD'),
        };
      }),
    );

    return messages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return [];
  }
};

export async function sendGmailMessage({ to, subject, message }) {
  const headers = [
    `To: ${to}`,
    'Content-Type: text/html; charset=UTF-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message,
  ];

  const email = headers.join('\n');

  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  try {
    const response = await window.gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to send Gmail message', error);
    throw error;
  }
}
