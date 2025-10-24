// Hamburger.js
"use client"
import React, { useState } from "react";

const Hamburger = ({ items, onDelete, onSave, onPrepare }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Hamburger Icon */}
      <button
        className="p-2 rounded-md bg-gray-200"
        onClick={toggleMenu}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-50">
          {items.length === 0 ? (
            <p className="p-2 text-gray-500">No items</p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 hover:bg-gray-100"
              >
                <span>{item}</span>
                <button
                  onClick={() => onDelete(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          )}

          <div className="flex justify-around p-2 border-t mt-2">
            <button
              onClick={onSave}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={onPrepare}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Prepare
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hamburger;
