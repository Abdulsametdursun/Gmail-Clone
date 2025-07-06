export const VALID_LABELS = [
  'INBOX',
  'SENT',
  'DRAFT',
  'SPAM',
  'TRASH',
  'STARRED',
  'IMPORTANT',
  'CATEGORY_PERSONAL',
  'CATEGORY_PROMOTIONS',
  'CATEGORY_SOCIAL',
  'CATEGORY_UPDATES',
  'CATEGORY_FORUMS',
];

export const fetchGmailMessages = async (accessToken, labelIds = []) => {
  try {
    let validLabels = labelIds.filter((id) => VALID_LABELS.includes(id));
    if (validLabels.length === 0) {
      validLabels = ['INBOX'];
    }
    const params = new URLSearchParams({ maxResults: '25' });
    validLabels.forEach((id) => params.append('labelIds', id));
    if (validLabels.includes('SPAM') || validLabels.includes('TRASH')) {
      params.append('includeSpamTrash', 'true');
    }

    // ✅ Step 1: Get the list of message IDs
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
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

    // ✅ Step 2: Fetch full message details
    const messages = await Promise.all(
      messageIds.map(async ({ id }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const msg = await msgRes.json();
        if (!msgRes.ok) {
          console.error('Gmail message fetch error:', msg);
          return null;
        }

        const headers = msg.payload?.headers || [];
        const getHeader = (name) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        let bodyData =
          msg.payload?.parts?.find((p) => p.mimeType === 'text/plain')?.body?.data ||
          msg.payload?.parts?.find((p) => p.mimeType === 'text/html')?.body?.data ||
          msg.payload?.body?.data ||
          '';
        let decodedBody = '';
        if (bodyData) {
          try {
            decodedBody = decodeURIComponent(
              escape(atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'))),
            );
          } catch (e) {
            decodedBody = atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }

        const msgLabelIds = msg.labelIds || [];

        const folderMap = {
          INBOX: 'inbox',
          SENT: 'sent',
          DRAFT: 'drafts',
          SPAM: 'spam',
          TRASH: 'trash',
          IMPORTANT: 'important',
          STARRED: 'starred',
        };

        const categoryMap = {
          CATEGORY_PERSONAL: 'Primary',
          CATEGORY_PROMOTIONS: 'Promotions',
          CATEGORY_SOCIAL: 'Social',
          CATEGORY_UPDATES: 'Updates',
          CATEGORY_FORUMS: 'Forms',
        };

        const folderKey = Object.keys(folderMap).find((l) => msgLabelIds.includes(l));
        const folder = folderKey ? folderMap[folderKey] : 'all';

        const categoryKey = Object.keys(categoryMap).find((l) => msgLabelIds.includes(l));
        const category = categoryKey ? categoryMap[categoryKey] : '';

        return {
          id: msg.id,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          message: decodedBody || msg.snippet,
          timestamp: { seconds: Math.floor(parseInt(msg.internalDate, 10) / 1000) },
          folder,
          category,
          labels: msgLabelIds,
          read: !msgLabelIds.includes('UNREAD'),
        };
      }),
    );

    return messages.filter(Boolean); // remove any nulls
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
