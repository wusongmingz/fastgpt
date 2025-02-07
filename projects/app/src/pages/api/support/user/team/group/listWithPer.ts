import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import {
  getGroupListWithManagePer,
  getGroupsByTmbId
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface GroupListResponse {
  _id: string;
  teamId: string;
  name: string;
}
async function handler(req: ApiRequestProps, res: ApiResponseType): Promise<GroupListResponse[]> {
  // 验证是否为团队 owner 或 root用户
  // const { teamId, tmbId } = await authUserPer({ req, authToken: true, per: ManagePermissionVal });
  // if (tmbId) {
  //   return await getGroupsByTmbId({ teamId, tmbId });
  // }
  // return await getGroupListWithManagePer(tmbId);
  const { teamId, tmbId } = await authCert({ req, authToken: true });
  return await getGroupsByTmbId({ teamId, tmbId, role: ['owner', 'admin'] });
}

export default NextAPI(handler);
