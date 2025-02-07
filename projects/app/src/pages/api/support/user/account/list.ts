import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getTeamMemberNames } from '@fastgpt/service/support/user/controller';
import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';

// 定义 GET 请求的查询参数类型
export type TokenLoginQuery = {}; // 可根据需要添加查询参数字段
export type TokenLoginResponse = {}; // 响应类型

async function handler(
  req: ApiRequestProps<null, TokenLoginQuery>, // 修改为 null 的请求体，使用查询参数
  _res: ApiResponseType<any>
): Promise<any> {
  // 验证用户凭证
  const {} = await authCert({ req, authToken: true });
  // 调用逻辑，返回团队成员名称
  return getTeamMemberNames();
}

export default NextAPI(handler);
