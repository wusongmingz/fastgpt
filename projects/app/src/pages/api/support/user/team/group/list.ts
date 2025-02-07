import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getGroupsByTmbId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface GetGroupsBody {}
interface GetGroupsQuery {}

async function handler(req: ApiRequestProps<GetGroupsBody, GetGroupsQuery>, res: ApiResponseType) {
  const { teamId, tmbId } = await authCert({ req, authToken: true });
  return getGroupsByTmbId({ teamId, tmbId });
}

export default NextAPI(handler);
