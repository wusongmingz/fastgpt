import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { jsonRes } from '@fastgpt/service/common/response';
import { POST } from '@fastgpt/service/common/api/serverRequest';
// 定义输入类型
export type GetGraphDataBody = {
  fileId: string; // 输入的 fileId
};
// 定义返回的类型（根据实际返回结果可能需要调整）
export type GraphDataResponse = {
  data: any; // 图谱数据的实际内容，具体字段根据接口返回调整
  message?: string;
};
/**
 * API 接口处理函数
 * @param req - 请求对象
 * @param res - 响应对象
 * @returns {Promise<GraphDataResponse>} - 返回图谱数据
 */

async function handler(
  req: ApiRequestProps<GetGraphDataBody>, // 该接口只接受一个 fileId 参数
  res: ApiResponseType<GraphDataResponse> // 返回的数据类型是图谱数据
): Promise<any> {
  const { fileId } = req.body; // 从请求体中获取 fileId
  const base = process.env.GRAPH_BASE_URL || 'http://127.0.0.1:8001/v1';
  try {
    // 发起 POST 请求，调用外部接口获取图谱数据
    const response = await POST<any>(`${base}/tran_map_data`, { fileId });
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
