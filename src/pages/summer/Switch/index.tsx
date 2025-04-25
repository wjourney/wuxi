import { View } from "@tarojs/components";
import { useState, useEffect } from "react";
import "./index.scss";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  onSelect?: (value: string) => void;
  defaultValue?: string;
}

export default function Switch({
  options = [],
  onSelect,
  defaultValue,
}: Props) {
  const [activeValue, setActiveValue] = useState(
    defaultValue || options[0]?.value
  );

  useEffect(() => {
    if (activeValue && onSelect) {
      onSelect(activeValue);
    }
  }, [activeValue]);

  return (
    <View className="tab-container">
      {options.map((option) => (
        <View
          key={option.value}
          className={`tab-item ${activeValue === option.value ? "active" : ""}`}
          onClick={() => setActiveValue(option.value)}
        >
          {option.label}
        </View>
      ))}
    </View>
  );
}
