import React, { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="border-b border-stone-400 pb-2">
      <div className="font-bold text-red-500">{title}</div>
      <div>{children}</div>
    </div>
  );
};

export default Section;
