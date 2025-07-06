export const fetchGmailMessages = async (accessToken) => {
  try {
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const listData = await listRes.json();

    if (!listRes.ok) {
      console.error('Gmail fetch error:', listData);
      throw new Error(listData.error?.message || 'Failed to fetch messages');
    }

    const messageIds = listData.messages || [];

    const messages = await Promise.all(
      messageIds.map(async ({ id }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
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
          read: !msg.labelIds?.includes('UNREAD'),
        };
      }),
    );

    return messages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return [];
  }
};

export async function sendEmail(accessToken, { to, subject, message }) {
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

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64EncodedEmail }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Failed to send Gmail message', err);
    throw new Error(err.error?.message || 'Failed to send Gmail message');
  }

  return res.json();
}
