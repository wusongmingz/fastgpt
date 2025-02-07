import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { deleteTeamMember } from '@fastgpt/service/support/user/team/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface DeleteTeamMemberBody {
  tmbId: string;
  userId: string;
}

// TODO: 若后续需求变化，可利用 TeamMemberStatus 做伪删除
async function handler(req: ApiRequestProps<DeleteTeamMemberBody>, res: ApiResponseType) {
  // 团队owner 用户才有权限
  const { tmbId, userId } = req.body;
  try {
    await authUserPer({ req, authToken: true, per: ManagePermissionVal });
    await deleteTeamMember({ tmbId, userId });
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
