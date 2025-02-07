import { NextAPI } from '@/service/middleware/entry';
import { updateTeamMemberGroup } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';

interface UpdateGroupBody {
  name: string;
  avatar?: string;
  intro?: string;
  _id: string;
}

async function handler(req: ApiRequestProps<UpdateGroupBody>, res: ApiResponseType) {
  const body = req.body;
  const { teamId, tmb } = await authUserPer({
    req,
    authToken: true,
    per: ManagePermissionVal
  });
  try {
    return await updateTeamMemberGroup({ ...body, teamId });
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
