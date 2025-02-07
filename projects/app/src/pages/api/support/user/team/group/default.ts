import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getTeamDefaultGroup } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

async function handler(req: ApiRequestProps, res: ApiResponseType) {
  const { teamId } = await authCert({ req, authToken: true });
  return getTeamDefaultGroup({ teamId });
}

export default NextAPI(handler);
