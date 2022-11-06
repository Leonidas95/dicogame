import classNames from 'classnames';

type ButtonColor = 'blue' | 'green' | 'orange' | 'red';
type ButtonVariant = 'light' | 'outline' | 'solid';
type ButtonSize = 'small' | 'medium' | 'large';

const ButtonVariantMap: Readonly<Record<ButtonVariant, Record<ButtonColor, string>>> = {
  light: {
    blue: 'bg-blue-100 border border-transparent text-blue-500 hover:text-white hover:bg-blue-500 ring-offset-white focus:ring-blue-500',
    green:
      'bg-green-100 border border-transparent text-green-500 hover:text-white hover:bg-green-500 ring-offset-white focus:ring-green-500',
    orange:
      'bg-orange-100 border border-transparent text-orange-500 hover:text-white hover:bg-orange-500 ring-offset-white focus:ring-orange-500',
    red: 'bg-red-100 border border-transparent text-red-500 hover:text-white hover:bg-red-500 ring-offset-white focus:ring-red-500',
  },
  outline: {
    blue: 'border-2 border-blue-200 text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 focus:ring-blue-200',
    green:
      'border-2 border-green-200 text-green-500 hover:text-white hover:bg-green-500 hover:border-green-500 focus:ring-green-200',
    orange:
      'border-2 border-orange-200 text-orange-500 hover:text-white hover:bg-orange-500 hover:border-orange-500 focus:ring-orange-200',
    red: 'border-2 border-red-200 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 focus:ring-red-200',
  },
  solid: {
    blue: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 border border-transparent',
    green: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 border border-transparent',
    orange: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 border border-transparent',
    red: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 border border-transparent',
  },
};

const ButtonDisabledMap: Readonly<Record<ButtonVariant, Record<ButtonColor, string>>> = {
  light: {
    blue: 'bg-blue-50 text-blue-400 hover:text-blue-400 hover:bg-blue-50',
    green: 'bg-green-50 text-green-400 hover:text-green-400 hover:bg-green-50',
    orange: 'bg-orange-50 text-orange-400 hover:text-orange-400 hover:bg-orange-50',
    red: 'bg-red-50 text-red-400 hover:text-red-400 hover:bg-red-50',
  },
  outline: {
    blue: 'text-blue-400 hover:text-blue-400 hover:bg-white hover:border-blue-200',
    green: 'text-green-400 hover:text-green-400 hover:bg-white hover:border-green-200',
    orange: 'text-orange-400 hover:text-orange-400 hover:bg-white hover:border-orange-200',
    red: 'text-red-400 hover:text-red-400 hover:bg-white hover:border-red-200',
  },
  solid: {
    blue: 'bg-blue-400 hover:bg-blue-400',
    green: 'bg-green-400 hover:bg-green-400',
    orange: 'bg-orange-400 hover:bg-orange-400',
    red: 'bg-red-400 hover:bg-red-400',
  },
};

const ButtonSizeMap: Readonly<Record<ButtonSize, string>> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  color,
  variant = 'solid',
  size = 'small',
  loading = false,
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      className={classNames(
        'py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
        { 'cursor-not-allowed': disabled || loading },
        ButtonVariantMap[variant][color],
        ButtonSizeMap[size],
        { [ButtonDisabledMap[variant][color]]: disabled || loading },
      )}
    >
      {children}
      {loading && (
        <span className="transition-all animate-spin w-4 h-4 border-2 border-current border-t-transparent text-current rounded-full" />
      )}
    </button>
  );
};
