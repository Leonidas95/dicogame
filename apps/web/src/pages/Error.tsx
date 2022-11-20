import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

export const Error = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white py-48">
      <div className="flex flex-col">
        <div className="flex flex-col items-center">
          <div className="text-green-500 font-bold text-7xl">404</div>

          <div className="font-bold text-3xl xl:text-7xl lg:text-6xl md:text-5xl mt-10">
            <FormattedMessage id="errorTitle" />
          </div>

          <div className="text-gray-400 font-medium text-sm md:text-xl lg:text-2xl mt-8">
            <FormattedMessage id="errorSubTitle" />{' '}
          </div>

          <Link to="/" className="text-green-400 hover:underline font-medium text-sm md:text-xl lg:text-2xl mt-8">
            <FormattedMessage id="errorGoToHome" />
          </Link>
        </div>
      </div>
    </div>
  );
};
