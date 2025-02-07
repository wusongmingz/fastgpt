import { NextAPI } from '@/service/middleware/entry';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
//packages/service/core/dataset/collection/schema.ts
//packages/service/core/dataset/schema.ts
/**
 * 定义返回的类型
 */

export type GraphListResponse = {
  success: boolean;
  message: string;
  data: Array<{
    datasetName: string;
    fileId: string;
    filename: string;
  }>;
};

/**
 * API 接口处理函数
 * @param req - 请求对象
 * @param res - 响应对象
 * @returns {Promise<GraphListResponse>} - 返回图谱展示列表
 */
async function handler(
  req: ApiRequestProps<null>, // 不需要请求体
  res: ApiResponseType<GraphListResponse>
): Promise<void> {
  try {
    const graphDatasets = await MongoDataset.aggregate([
      { $match: { type: 'graph' } }, // 先筛选出 graph 类型的数据集
      {
        $lookup: {
          from: 'dataset_collections', // 关联的集合
          localField: '_id', // 本集合中的字段
          foreignField: 'datasetId', // 关联集合中的字段
          as: 'fileDocument' // 合并后的结果字段
        }
      },
      { $unwind: { path: '$fileDocument', preserveNullAndEmptyArrays: true } }, // 展开嵌套的 fileDocument
      {
        $project: {
          _id: 1,
          name: 1,
          'fileDocument.name': 1,
          'fileDocument.fileId': 1
        }
      }
    ]);

    const data = graphDatasets
      .map((dataset) => {
        if (dataset.fileDocument) {
          return {
            datasetName: dataset.name,
            fileId: dataset.fileDocument.fileId,
            filename: dataset.fileDocument.name
          };
        }
        return null; // 如果没有 fileDocument，返回 null
      })
      .filter((item) => item !== null); // 过滤掉 null 或 undefined

    console.log('finalData', data);
    // 构造返回结果
    const response = {
      success: true,
      message: '图谱展示列表结果',
      data: data
    };
    // 返回成功响应
    res.status(200).json(response);
  } catch (err) {
    // 捕获异常并返回错误响应
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

export default NextAPI(handler);
