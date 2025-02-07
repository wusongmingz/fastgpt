import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import {
  getGroupsByName,
  getGroupsByTmbId,
  updateTeamMemberGroup
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface GetGroupsBody {}

interface GetGroupsQuery {
  name: string;
}

async function handler(req: ApiRequestProps<GetGroupsBody, GetGroupsQuery>, res: ApiResponseType) {
  const { name } = req.query;
  const { teamId, tmbId } = await authCert({ req, authToken: true });
  try {
    return await getGroupsByName({ name, teamId, tmbId });
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
