import React from "react";

interface ToolboxButtonProps {
  isToolboxOpen: boolean;
  toggleToolbox: () => void;
}

const ToolboxButton: React.FC<ToolboxButtonProps> = ({ isToolboxOpen, toggleToolbox }) => {
  return (
    <button
      onClick={toggleToolbox}
      className="fixed left-4 top-20 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 z-20"
    >
      {isToolboxOpen ? "Close Toolbox" : "Open Toolbox"}
    </button>
  );
};

export default ToolboxButton;