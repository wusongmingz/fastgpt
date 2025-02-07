import { GET, POST, DELETE, PUT } from '@/web/common/api/request';

type getGraphDataProps = {
  fileId: string;
  selected_folder?: string;
};
export type graphListResItem = {
  datasetName: string;
  fileId: string;
  filename: string;
};
export type searchGraphProps = {
  searchname?: string;
};

export const getGraphList = () => {
  return GET<graphListResItem[]>('/graphrag/graphList');
};

export const getGraphData = (data: getGraphDataProps) => {
  return POST<any>('/graphrag/graphWebData', data);
};

//图谱搜索
export const searchGraph = (data: searchGraphProps) => {
  return POST<any>('/graphrag/graphSearch', data);
};
