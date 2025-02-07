import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { createUser } from '@fastgpt/service/support/user/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';

export type adduserQuery = {};
export type adduserBody = {
  username: string;
  password: string;
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

export type CreateTeamMemberGroupResponse = {
  message: string;
};

/**
 * API 接口处理函数
 * @param req - 请求对象
 * @param res - 响应对象
 * @returns {Promise<CreateTeamMemberGroupResponse>} - 返回创建结果
 */
async function handler(
  req: ApiRequestProps<adduserBody, adduserQuery>,
  res: ApiResponseType<any>
): Promise<any> {
  // 认证并获取 tmbId
  // const { tmbId } = await authCert({ req, authToken: true });
  // 获取请求体中的用户数据
  const userData = req.body;
  try {
    // 调用封装的 createUser 函数
    const response = await createUser({
      userData
      // inviterId: tmbId
    });
    // 返回成功响应
    return res.status(201).json(response);
  } catch (error) {
    console.error('用户创建失败:', error);
    return res.status(500).json({ message: '用户创建失败', error });
  }
}

export default NextAPI(handler);
