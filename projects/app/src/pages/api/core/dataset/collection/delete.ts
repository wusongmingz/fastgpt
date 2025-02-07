import type { NextApiRequest } from 'next';
import { findCollectionAndChild } from '@fastgpt/service/core/dataset/collection/utils';
import { delCollectionAndRelatedSources } from '@fastgpt/service/core/dataset/collection/controller';
import { authDatasetCollection } from '@fastgpt/service/support/permission/dataset/auth';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@fastgpt/global/support/permission/constant';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { POST } from '@fastgpt/service/common/api/serverRequest';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
async function handler(req: NextApiRequest) {
  const { id: collectionId } = req.query as { id: string };
  if (!collectionId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }
  const { teamId, collection } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: WritePermissionVal
  });
  // find all delete id
  const collections = await findCollectionAndChild({
    teamId,
    datasetId: collection.datasetId._id,
    collectionId,
    fields: '_id teamId datasetId fileId metadata'
  });
  // 新增删除图功能
  let fileIds = [];
  if (collections && collections.length > 0) {
    for (const item of collections) {
      if (item.fileId) {
        fileIds.push(item.fileId);
      }
    }
  }
  const base = process.env.GRAPH_BASE_URL;
  if (fileIds.length > 0) {
    const response = await POST<any>(`${base}/delete_knowledge_base`, {
      fileIds // 传递 fileIds 数组
    });
    console.log('删除图数据集结束', response.data);
  }

  // delete
  await mongoSessionRun((session) =>
    delCollectionAndRelatedSources({
      collections,
      session
    })
  );
}

export default NextAPI(handler);
