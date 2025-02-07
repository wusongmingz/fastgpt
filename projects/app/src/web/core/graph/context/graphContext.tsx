import React, { useCallback, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

// 定义上下文的类型
type GraphContextType = {
  graphData: any;
  updateGraphData: (data: any) => void;
};

// 创建上下文
const GraphContext = createContext<GraphContextType | undefined>(undefined);

// ...existing code...

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graphData, setGraphData] = useState<any>(null);

  const updateGraphData = useCallback((data: any) => {
    setGraphData(data);
  }, []);

  return (
    <GraphContext.Provider value={{ graphData, updateGraphData }}>{children}</GraphContext.Provider>
  );
};
