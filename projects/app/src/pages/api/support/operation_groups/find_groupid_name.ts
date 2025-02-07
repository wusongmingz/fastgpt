// 引入一些需要的模块和类型
import { authCert as originalAuthCert } from '@fastgpt/service/support/permission/auth/common';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { AuthModeType } from '@fastgpt/service/support/permission/type';
import {
  getGroupIdByName,
  getTmbIdByUserId
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { parseHeaderCert } from '@fastgpt/service/support/permission/controller';
import { AuthUserTypeEnum, PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
// 定义一些类型
export type TokenLoginQuery = { groupname: string };
export type TokenLoginBody = {};
export type TokenLoginResponse = {};

// 定义一个handler函数，它接收一个请求和一个响应对象
async function handler(
  req: ApiRequestProps<TokenLoginBody, TokenLoginQuery>,
  _res: ApiResponseType<any>
) {
  const { groupname } = req.query;
  // 调用更新后的authCert方法，获取name字段
  // 假设你想根据name字段获取一个groupId，这里只是一个示例
  const groupid = getGroupIdByName(groupname);
  return _res.json({ groupid: groupid });
}

// 导出NextAPI中间件，它使用handler函数处理请求
export default NextAPI(handler);
