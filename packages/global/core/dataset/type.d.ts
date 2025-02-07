import type { LLMModelItemType, VectorModelItemType } from '../../core/ai/model.d';
import { PermissionTypeEnum } from '../../support/permission/constant';
import { PushDatasetDataChunkProps } from './api';
import {
  DatasetCollectionTypeEnum,
  DatasetStatusEnum,
  DatasetTypeEnum,
  SearchScoreTypeEnum,
  TrainingModeEnum
} from './constants';
import { DatasetPermission } from '../../support/permission/dataset/controller';
import { Permission } from '../../support/permission/controller';

export type DatasetSchemaType = {
  _id: string;
  parentId?: string;
  userId: string;
  teamId: string;
  tmbId: string;
  updateTime: Date;

  selectColor?: string;
  avatar: string;
  name: string;
  vectorModel: string;
  agentModel: string;
  intro: string;
  type: `${DatasetTypeEnum}`;
  status: `${DatasetStatusEnum}`;
  websiteConfig?: {
    url: string;
    selector: string;
  };
  externalReadUrl?: string;
  inheritPermission: boolean;

  // abandon
  defaultPermission?: number;
};

export type DatasetCollectionSchemaType = {
  _id: string;
  teamId: string;
  tmbId: string;
  datasetId: string;
  parentId?: string;
  name: string;
  type: DatasetCollectionTypeEnum;
  createTime: Date;
  updateTime: Date;
  forbid?: boolean;

  trainingType: TrainingModeEnum;
  chunkSize: number;
  chunkSplitter?: string;
  qaPrompt?: string;
  ocrParse?: boolean;

  tags?: string[];

  fileId?: string; // local file id
  rawLink?: string; // link url
  externalFileId?: string; //external file id

  rawTextLength?: number;
  hashRawText?: string;
  externalFileUrl?: string; // external import url
  metadata?: {
    webPageSelector?: string;
    relatedImgId?: string; // The id of the associated image collections

    [key: string]: any;
  };
};

export type DatasetCollectionTagsSchemaType = {
  _id: string;
  teamId: string;
  datasetId: string;
  tag: string;
};

export type DatasetDataIndexItemType = {
  defaultIndex: boolean;
  dataId: string; // pg data id
  text: string;
};
export type DatasetDataSchemaType = {
  _id: string;
  userId: string;
  teamId: string;
  tmbId: string;
  datasetId: string;
  collectionId: string;
  datasetId: string;
  collectionId: string;
  chunkIndex: number;
  updateTime: Date;
  q: string; // large chunks or question
  a: string; // answer or custom content
  forbid?: boolean;
  fullTextToken: string;
  indexes: DatasetDataIndexItemType[];
  rebuilding?: boolean;
};

export type DatasetTrainingSchemaType = {
  _id: string;
  userId: string;
  teamId: string;
  tmbId: string;
  datasetId: string;
  collectionId: string;
  billId: string;
  expireAt: Date;
  lockTime: Date;
  mode: TrainingModeEnum;
  model: string;
  prompt: string;
  dataId?: string;
  q: string;
  a: string;
  chunkIndex: number;
  weight: number;
  indexes: Omit<DatasetDataIndexItemType, 'dataId'>[];
};

export type CollectionWithDatasetType = Omit<DatasetCollectionSchemaType, 'datasetId'> & {
  datasetId: DatasetSchemaType;
};
export type DatasetDataWithCollectionType = Omit<DatasetDataSchemaType, 'collectionId'> & {
  collectionId: DatasetCollectionSchemaType;
};

/* ================= dataset ===================== */
export type DatasetSimpleItemType = {
  _id: string;
  avatar: string;
  type: `${DatasetTypeEnum}`;
  name: string;
  vectorModel: VectorModelItemType;
};
export type DatasetListItemType = {
  _id: string;
  tmbId: string;
  avatar: string;
  updateTime: Date;
  name: string;
  intro: string;
  type: `${DatasetTypeEnum}`;
  permission: DatasetPermission;
  vectorModel: VectorModelItemType;
  inheritPermission: boolean;
  private?: boolean;
  defaultPermission?: any;
  selectColor?: string;
};

export type DatasetItemType = Omit<DatasetSchemaType, 'vectorModel' | 'agentModel'> & {
  vectorModel: VectorModelItemType;
  agentModel: LLMModelItemType;
  permission: DatasetPermission;
};

/* ================= tag ===================== */
export type DatasetTagType = {
  _id: string;
  tag: string;
};

export type TagUsageType = {
  tagId: string;
  collections: string[];
};

/* ================= collection ===================== */
export type DatasetCollectionItemType = CollectionWithDatasetType & {
  sourceName: string;
  sourceId?: string;
  file?: DatasetFileSchema;
  permission: DatasetPermission;
};

/* ================= data ===================== */
export type DatasetDataItemType = {
  id: string;
  teamId: string;
  datasetId: string;
  updateTime: Date;
  collectionId: string;
  sourceName: string;
  sourceId?: string;
  q: string;
  a: string;
  chunkIndex: number;
  indexes: DatasetDataIndexItemType[];
  isOwner: boolean;
  graph_response?: GraphResponse;
  // permission: DatasetPermission;
};

export type GraphResponse = {
  success: boolean;
  message: string;
  data: {
    context_data:{
      data: {
        draggable: boolean;
      }[];
      links: {
        source: num
        name: string;ber;
        target: number;
        value: string;
      }[];
    };
    llm_data:string;
  };
};
/* --------------- file ---------------------- */
export type DatasetFileSchema = {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  contentType: string;
  metadata: {
    teamId: string;
    tmbId: string;
    encoding?: string;
  };
};

/* ============= search =============== */
export type SearchDataResponseItemType = Omit<
  DatasetDataItemType,
  'teamId' | 'indexes' | 'isOwner'
> & {
  score: { type: `${SearchScoreTypeEnum}`; value: number; index: number }[];
  // score: number;
};
