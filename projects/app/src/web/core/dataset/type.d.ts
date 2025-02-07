import type { PushDatasetDataChunkProps } from '@fastgpt/global/core/dataset/api';
import { TrainingModeEnum } from '@fastgpt/global/core/dataset/constants';
import { ImportProcessWayEnum } from './constants';
import { UseFormReturn } from 'react-hook-form';

export type ImportSourceItemType = {
  id: string;

  createStatus: 'waiting' | 'creating' | 'finish';
  metadata?: Record<string, any>;
  errorMsg?: string;

  // source
  sourceName: string;
  icon: string;

  // file
  sourceSize?: string;
  isUploading?: boolean;
  uploadedFileRate?: number;
  dbFileId?: string; // 存储在数据库里的文件Id，这个 ID 还是图片和集合的 metadata 中 relateId
  file?: File;

  // link
  link?: string;

  // custom text
  rawText?: string;

  // external file
  externalFileUrl?: string;
  externalFileId?: string;
};

export type ImportSourceParamsType = UseFormReturn<
  {
    chunkSize: number;
    chunkOverlapRatio: number;
    customSplitChar: string;
    prompt: string;
    mode: TrainingModeEnum;
    way: ImportProcessWayEnum;
  },
  any
>;

export type GraphMetaData = {
  create_final_documents: {
    id: {
      [key: string]: string;
    };
    title: {
      [key: string]: string;
    };
  };
  create_final_text_units: GraphTextUnitData[];
  create_final_entities: GraphEntityData[];
  create_final_relationships: GraphRelationData[];
};

export type GraphTextUnitData = {
  id: string;
  text: string;
  n_tokens: number;
  document_ids: string[];
};

export type GraphEntityData = {
  name: string;
  type: string;
  description: string;
  human_readable_id: number;
  id: string;
  text_unit_ids: string[];
};

export type GraphRelationData = {
  source: string;
  target: string;
  id: string;
  rank: number;
  weight: number;
  human_readable_id: number;
  description: string;
  text_unit_ids: string[];
};
