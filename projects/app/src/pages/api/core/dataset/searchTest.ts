import type { NextApiRequest } from 'next';
import type { SearchTestProps } from '@/global/core/dataset/api.d';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { pushGenerateVectorUsage } from '@/service/support/wallet/usage/push';
import { searchDatasetData } from '@fastgpt/service/core/dataset/search/controller';
import { updateApiKeyUsage } from '@fastgpt/service/support/openapi/tools';
import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import { getLLMModel } from '@fastgpt/service/core/ai/model';
import { datasetSearchQueryExtension } from '@fastgpt/service/core/dataset/search/utils';
import {
  checkTeamAIPoints,
  checkTeamReRankPermission
} from '@fastgpt/service/support/permission/teamLimit';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { POST } from '@fastgpt/service/common/api/serverRequest';
import { GraphEntityData } from '@/web/core/dataset/type';

interface ResponseType {
  data: {
    context_data: {
      reports: GraphSearchReportsData[];
      entities: GraphSearchEntityData[];
      relationships: GraphSearchRelationshipsData[];
    };
  };
}

export interface GraphSearchEntityData {
  id: string;
  entity: string;
  description: string;
}

export interface GraphSearchRelationshipsData {
  id: string;
  source: string;
  target: string;
  description: string;
}

export interface GraphSearchReportsData {}

async function handler(req: NextApiRequest) {
  const {
    datasetId,
    text,
    limit = 1500,
    similarity,
    searchMode, //检索模式
    usingReRank,
    datasetSearchUsingExtensionQuery = true,
    datasetSearchExtensionModel,
    datasetSearchExtensionBg = ''
  } = req.body as SearchTestProps;
  console.log('req.body_lay: ', req.body);
  if (!datasetId || !text) {
    return Promise.reject(CommonErrEnum.missingParams);
  }
  const start = Date.now();

  // auth dataset role
  const { dataset, teamId, tmbId, apikey } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: ReadPermissionVal
  });
  // auth balance
  await checkTeamAIPoints(teamId);

  // 图知识库逻辑
  const datasetInfo = await MongoDataset.findOne({ _id: datasetId });
  if (datasetInfo && datasetInfo.type === 'graph') {
    {
      const datasetCollectionInfo = await MongoDatasetCollection.findOne({
        datasetId
      });
      const fileId = datasetCollectionInfo?.fileId;
      if (!fileId) {
        return {
          message: '图知识库的数据库查找失败'
        };
      }

      const base = process.env.GRAPH_BASE_URL || 'http://127.0.0.1:8001';
      const url = `${base}/chat/completions`;
      const response = await POST<ResponseType>(url, {
        fileId, // 传递 fileId
        content: text,
        query_options: {
          query_type: searchMode // 必传的查询类型
        }
      });
      console.log('图知识库搜索测试响应：', response);
      const { relationships, reports } = response?.data?.context_data;
      return {
        ...response?.data?.context_data,
        list: (searchMode === 'local' ? relationships : reports) ?? [],
        duration: `${((Date.now() - start) / 1000).toFixed(3)}s`,
        searchMode
      };
    }
  }

  // query extension
  const extensionModel =
    datasetSearchUsingExtensionQuery && datasetSearchExtensionModel
      ? getLLMModel(datasetSearchExtensionModel)
      : undefined;
  const { concatQueries, rewriteQuery, aiExtensionResult } = await datasetSearchQueryExtension({
    query: text,
    extensionModel,
    extensionBg: datasetSearchExtensionBg
  });

  const { searchRes, tokens, ...result } = await searchDatasetData({
    teamId,
    reRankQuery: rewriteQuery,
    queries: concatQueries,
    model: dataset.vectorModel,
    limit: Math.min(limit, 20000),
    similarity,
    datasetIds: [datasetId],
    searchMode,
    usingReRank: usingReRank && (await checkTeamReRankPermission(teamId))
  });

  // push bill
  const { totalPoints } = pushGenerateVectorUsage({
    teamId,
    tmbId,
    tokens,
    model: dataset.vectorModel,
    source: apikey ? UsageSourceEnum.api : UsageSourceEnum.fastgpt,

    ...(aiExtensionResult &&
      extensionModel && {
        extensionModel: extensionModel.name,
        extensionTokens: aiExtensionResult.tokens
      })
  });
  if (apikey) {
    updateApiKeyUsage({
      apikey,
      totalPoints: totalPoints
    });
  }

  return {
    list: searchRes,
    duration: `${((Date.now() - start) / 1000).toFixed(3)}s`,
    queryExtensionModel: aiExtensionResult?.model,
    ...result
  };
}

export default NextAPI(useReqFrequencyLimit(1, 2), handler);
