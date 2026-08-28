const DEFAULT_WELCOME_MESSAGE =
  'Welcome to FlexBioDB!';

import {
  SETTINGS_DB_WELCOME_MESSAGE,
} from '@/constants';

interface DBSetting {
  name: string;
  value: string;
}

export async function getDBWelcomeMessage(): Promise<string> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn(
      'NEXT_PUBLIC_API_URL is not defined. Using default welcome message.'
    );

    return DEFAULT_WELCOME_MESSAGE;
  }

  try {
    const response = await fetch(
      `${apiUrl}/db_welcome_message`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `Failed to load DB welcome message. HTTP status: ${response.status}`
      );

      return DEFAULT_WELCOME_MESSAGE;
    }

    const data: DBSetting[] =
      await response.json();

    const welcomeMessageSetting =
      data.find(
        (item) =>
          item.name ===
          SETTINGS_DB_WELCOME_MESSAGE
      );

    const welcomeMessage =
      welcomeMessageSetting?.value?.trim();

    if (!welcomeMessage) {
      return DEFAULT_WELCOME_MESSAGE;
    }

    return welcomeMessage;
  } catch (error) {
    console.error(
      'Failed to load DB welcome message:',
      error
    );

    return DEFAULT_WELCOME_MESSAGE;
  }
}