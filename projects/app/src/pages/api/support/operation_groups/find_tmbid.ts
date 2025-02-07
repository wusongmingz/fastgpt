import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getTmbIdByUserId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
export type TokenLoginQuery = {};
export type TokenLoginBody = { userId: string };
export type TokenLoginResponse = {};
async function handler(
  req: ApiRequestProps<TokenLoginBody, TokenLoginQuery>,
  _res: ApiResponseType<any>
) {
  const { userId } = req.body;
  return getTmbIdByUserId(userId);
}
export default NextAPI(handler);
