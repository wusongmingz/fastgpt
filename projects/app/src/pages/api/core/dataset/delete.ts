import type { NextApiRequest } from 'next';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { delDatasetRelevantData } from '@fastgpt/service/core/dataset/controller';
import { findDatasetAndAllChildren } from '@fastgpt/service/core/dataset/controller';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { OwnerPermissionVal } from '@fastgpt/global/support/permission/constant';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { POST } from '@fastgpt/service/common/api/serverRequest';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
async function handler(req: NextApiRequest) {
  const { id: datasetId } = req.query as {
    id: string;
  };

  if (!datasetId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // auth owner
  const { teamId } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: OwnerPermissionVal
  });

  const datasets = await findDatasetAndAllChildren({
    teamId,
    datasetId
  });
  // 新增删除图功能
  // 从 MongoDatasetCollection 引擎中根据 datasetId 搜索并提取里面的 fileId 字段
  const collectionData = await MongoDatasetCollection.find({
    datasetId: { $in: datasets.filter(dataset => dataset.type === 'graph').map(dataset => dataset._id) }
  });
  if (collectionData && collectionData.length > 0) {
    console.log('删除图知识库开始');
    const fileIds = collectionData.map(item => item.fileId);
    const base = process.env.GRAPH_BASE_URL;
    const response = await POST<any>(`${base}/delete_knowledge_base`, {
      fileIds // 传递 fileIds 数组
    });
    console.log('删除图知识库结束', response.data);
  }

  // delete all dataset.data and pg data
  await mongoSessionRun(async (session) => {
    // delete dataset data
    await delDatasetRelevantData({ datasets, session });
    await MongoDataset.deleteMany(
      {
        _id: { $in: datasets.map((d) => d._id) }
      },
      { session }
    );
  });
}

export default NextAPI(handler);
