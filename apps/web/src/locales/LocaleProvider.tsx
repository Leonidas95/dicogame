import { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';

import { translations } from '.';

export const LocaleProvider = ({ children }: PropsWithChildren<{}>) => {
  const language = navigator.language.split(/[-_]/)[0];

  return (
    <IntlProvider locale={language} messages={translations[language]} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};
