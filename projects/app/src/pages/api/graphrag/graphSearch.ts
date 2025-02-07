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
  req: ApiRequestProps<{ searchname?: string }>, // 接收 searchname 参数
  res: ApiResponseType<GraphListResponse>
): Promise<void> {
  try {
    const { searchname } = req.body; // 确保从请求体中提取参数
    // 查询条件
    const query: any = { type: 'graph' };
    console.log('searchname_lay:', searchname);
    if (searchname) {
      query.name = { $regex: searchname, $options: 'i' }; // 模糊查询，忽略大小写
    }
    console.log('query_lay:', query);
    const graphDatasets = await MongoDataset.aggregate([
      { $match: query }, // 使用动态查询条件筛选符合条件的文档
      {
        $lookup: {
          from: 'dataset_collections', // 关联的集合
          localField: '_id', // 本集合中的字段
          foreignField: 'datasetId', // 关联集合中的字段
          as: 'fileDocument' // 合并后的结果字段
        }
      },
      { $unwind: { path: '$fileDocument', preserveNullAndEmptyArrays: true } }, // 展开 fileDocument，如果没有匹配到的数据，保持 null
      {
        $project: {
          _id: 1,
          name: 1,
          'fileDocument.name': 1,
          'fileDocument.fileId': 1
        }
      }
    ]);

    console.log('graphDatasets', graphDatasets);
    console.log('graphDatasets_type', typeof graphDatasets);

    // 构造返回数据
    const data = graphDatasets
      .map((dataset) => {
        if (dataset.fileDocument) {
          return {
            datasetName: dataset.name,
            fileId: dataset.fileDocument.fileId,
            filename: dataset.fileDocument.name
          };
        }
        return null; // 如果没有对应的 fileDocument，返回 null
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
