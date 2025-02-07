import { NextAPI } from '@/service/middleware/entry';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { jsonRes } from '@fastgpt/service/common/response';
interface UpdatePasswordBody {
  tmbId: string;
  password: string;
}
async function handler(req: ApiRequestProps<UpdatePasswordBody>, res: ApiResponseType) {
  const { tmbId, password } = req.body;
  await authUserPer({
    req,
    authToken: true,
    per: ManagePermissionVal
  });
  const tmb = await MongoTeamMember.findById(tmbId);
  if (!tmb) {
    throw new Error('can not find member');
  }
  const userId = tmb.userId;
  // auth old password
  const user = await MongoUser.findOne({
    _id: userId
  });

  // 更新对应的记录
  await MongoUser.findByIdAndUpdate(userId, {
    password: password
  });

  jsonRes(res, { code: 200, message: '修改成功', data: null });
}
export default NextAPI(handler);
