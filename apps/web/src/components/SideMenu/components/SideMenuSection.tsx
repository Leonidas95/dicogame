type SideMenuSectionProps = {
  label: string;
};

export const SideMenuSection = ({ label }: SideMenuSectionProps) => {
  return (
    <li className="px-5">
      <div className="flex flex-row items-center h-8">
        <div className="text-sm font-light tracking-wide text-gray-500">{label}</div>
      </div>
    </li>
  );
};
