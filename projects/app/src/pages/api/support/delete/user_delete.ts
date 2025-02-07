import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { deleteUser } from '@fastgpt/service/support/user/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';

export type deleteUserQuery = {};
export type deleteUserBody = {
  userId: string; // 用户 ID
  username?: string; // 用户名
};

export type DeleteUserResponse = {
  message: string;
};

/**
 * API 接口处理函数
 * @param req - 请求对象
 * @param res - 响应对象
 * @returns {Promise<DeleteUserResponse>} - 返回删除结果
 */
async function handler(
  req: ApiRequestProps<deleteUserBody, deleteUserQuery>,
  res: ApiResponseType<any>
): Promise<any> {
  // 认证并获取 tmbId
  //const { tmbId } = await authCert({ req, authToken: true });

  // 获取请求查询参数中的用户数据
  const userData = req.body;

  // 检查是否提供了用户名或用户 ID
  if (!userData) {
    return res.status(400).json({ message: '请提供用户名或用户 ID' });
  }

  try {
    // 调用封装的 deleteUser 函数
    const response = await deleteUser({ userData });

    // 返回成功响应
    return res.status(200).json(response);
  } catch (error) {
    console.error('用户删除失败:', error);
    return res.status(500).json({ message: '用户删除失败', error });
  }
}

export default NextAPI(handler);
