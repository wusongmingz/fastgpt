import { UserType } from '@fastgpt/global/support/user/type';
import { MongoUser } from './schema';
import { getTmbInfoByTmbId, getUserDefaultTeam } from './team/controller';
import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';
import {
  createTeamMember,
  getTeamDefaultGroup,
  getTmbIdByUserId
} from '../permission/memberGroup/controllers';
import { MongoGroupMemberModel } from '../permission/memberGroup/groupMemberSchema';

export async function authUserExist({ userId, username }: { userId?: string; username?: string }) {
  if (userId) {
    return MongoUser.findOne({ _id: userId });
  }
  if (username) {
    return MongoUser.findOne({ username });
  }
  return null;
}

export async function getUserDetail({
  tmbId,
  userId
}: {
  tmbId?: string;
  userId?: string;
}): Promise<UserType> {
  const tmb = await (async () => {
    if (tmbId) {
      try {
        const result = await getTmbInfoByTmbId({ tmbId });
        return result;
      } catch (error) {}
    }
    if (userId) {
      return getUserDefaultTeam({ userId });
    }
    return Promise.reject(ERROR_ENUM.unAuthorization);
  })();
  const user = await MongoUser.findById(tmb.userId);
  if (!user) {
    return Promise.reject(ERROR_ENUM.unAuthorization);
  }
  const group = await getTeamDefaultGroup({ teamId: tmb.teamId });
  return {
    _id: user._id,
    username: user.username,
    avatar: user.avatar,
    timezone: user.timezone,
    promotionRate: user.promotionRate,
    openaiAccount: user.openaiAccount,
    team: tmb,
    defaultGroup: group,
    notificationAccount: tmb.notificationAccount,
    permission: tmb.permission
  };
}

// 添加用户的函数
export async function addUser(userData: {
  username: string;
  password: string;
  // 下面是可选字段，根据实际需求调整是否传入这些参数
  phonePrefix?: Number;
  status?: string;
  avatar?: string;
  inviterId?: string;
  promotionRate?: number;
  openaiAccount?: {
    key?: string;
    baseUrl?: string;
  };
  timezone?: string;
  lastLoginTmbId?: string;
  fastgpt_sem?: object;
}): Promise<null> {
  try {
    // 检查必填字段是否传入
    if (!userData.username || !userData.password) {
      return null;
    }

    // 创建要插入的用户对象，将传入的参数赋值给对应字段
    const newUser = new MongoUser(userData);

    // 保存用户数据到数据库，这会触发UserSchema中定义的各种验证规则等
    const savedUser = await newUser.save();
    //return savedUser as UserType;
    return null;
  } catch (error) {
    console.error('添加用户时出现错误:', error);
    return null;
  }
}

import { MongoTeamMember } from './team/teamMemberSchema'; //江
//查询所有的用户名和用户ID
export async function getTeamMemberNames() {
  try {
    // 从MongoTeamMember表查找所有用户的 _id 和 name
    const allTeamMembers = await MongoTeamMember.find({}).lean();
    const allTeamMemberNames = allTeamMembers.map((member) => member.name);
    const allTeamMemberIds = allTeamMembers.map((member) => member._id);
    return { allTeamMembers };
  } catch (error) {
    console.error('获取大团队里的所有成员ID和名字失败:', error);
  }
}

//新增用户
export const createUser = async ({
  userData
}: {
  userData: {
    username: string;
    password: string;
    role?: string;
    phonePrefix?: number;
    status?: string;
    avatar?: string;
    inviterId?: string;
    promotionRate?: number;
    openaiAccount?: {
      key?: string;
      baseUrl?: string;
    };
    timezone?: string;
    lastLoginTmbId?: string;
    fastgpt_sem?: object;
  };
}): Promise<{ message: string }> => {
  // 校验必填项
  if (!userData.username || !userData.password) {
    throw new Error('用户名和密码为必填项');
  }

  try {
    // 调用 addUser 函数插入用户数据
    await addUser({ ...userData });
    const username = userData.username;
    const user = await authUserExist({ username });

    // 判断 role 是否为空，若为空则不传 role 字段
    const memberData: any = {
      userId: user ? user._id : null,
      username: username
    };

    // 只有在 role 存在时才添加 role 字段
    if (userData.role) {
      memberData.role = userData.role;
    }

    // 再将用户信息填到 member 表中
    await createTeamMember(memberData);
    return { message: '用户创建成功' };
  } catch (error) {
    console.error('用户创建失败:', error);
    throw new Error('用户创建失败');
  }
};

// 删除用户的函数
export const deleteUser = async ({
  userData
}: {
  userData: {
    userId: string;
    username?: string;
  };
}): Promise<{ message: string }> => {
  // 检查是否提供了用户名或用户 ID
  if (!userData.userId) {
    throw new Error('请提供用户 ID');
  }

  try {
    // 根据用户名或用户 ID 查找用户
    const userId = userData.userId;
    const user = await authUserExist({ userId });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 删除用户
    //await MongoUser.deleteOne({ _id:userId });
    //console.log(userId)
    // 删除团队成员记录

    console.log(userId);
    const group = await getTmbIdByUserId(userId);
    console.log(group);
    //const objectId = new mongoose.Types.ObjectId(group._id);
    const group1 = group._id;
    //console.log(group1);
    //onst groupId =  getGroupIdByTmbId(group._id);
    //const group2 = groupId._id;
    console.log(group1);
    //const group2 = "6762274166e71d7fe8ae4897";
    const result1 = await MongoGroupMemberModel.findOne({ tmbId: String(group1) }).lean();

    //const result2 = await MongoGroupMemberModel.findOne({});
    console.log('关键词查找:', result1);
    //console.log('默认查找:', result2);
    //await MongoGroupMemberModel.deleteOne({tmbId:usertmb});

    //await MongoTeamMember.deleteOne({ userId:userId});

    return { message: '用户删除成功' };
  } catch (error) {
    console.error('用户删除失败:', error);
    throw new Error('用户删除失败');
  }
};
