import { NextAPI } from '@/service/middleware/entry';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import teamErr from '@fastgpt/global/common/error/code/team';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { createTeamMemberGroup } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface CreateGroupBody {
  name: string;
  avatar?: string;
  intro?: string;
}

interface CreateGroupQuery {}

async function handler(req: ApiRequestProps<CreateGroupBody>, res: ApiResponseType) {
  const body = req.body;

  try {
    const { teamId, tmbId, permission } = await authUserPer({
      req,
      authToken: true,
      per: ManagePermissionVal
    });
    const group = await MongoMemberGroupModel.findOne({ name: body.name }).lean();
    if (group) {
      return Promise.reject('该团队已存在');
    }
    return await createTeamMemberGroup({ ...body, teamId, tmbId });
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
