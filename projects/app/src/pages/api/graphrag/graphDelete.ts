import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { jsonRes } from '@fastgpt/service/common/response';
import { POST } from '@fastgpt/service/common/api/serverRequest';
// 定义输入类型
export type GetGraphDataBody = {
  fileId: string; // 输入的 fileId
};

export type GraphDataResponse = {
  data: any;
  message?: string;
};
/**
 * API 接口处理函数
 * @param req - 请求对象
 * @param res - 响应对象
 * @returns {Promise<GraphDataResponse>}
 */
async function handler(
  req: ApiRequestProps<GetGraphDataBody>, // 该接口只接受一个 fileId 参数
  res: ApiResponseType<GraphDataResponse>
): Promise<any> {
  const { fileId } = req.body; // 从请求体中获取 fileId
  try {
    const base = process.env.GRAPH_URL;
    const response = await POST<any>(`${base}/delete_knowledge_base`, {
      fileId // 传递 fileId
    });
    // 返回外部接口返回的图谱数据
    jsonRes(res, {
      code: 200,
      message: response.message,
      data: response.data
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

export default NextAPI(handler);
