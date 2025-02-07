// import { authCert } from '@fastgpt/service/support/permission/auth/common';
// import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
// import {
//   deleteAllUsersByGroupId // 删除团队中所有用户的函数
// } from '@fastgpt/service/support/permission/memberGroup/controllers';
// import { NextAPI } from '@/service/middleware/entry';
// import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';

// /**
//  * API 请求体类型
//  */
// export type DeleteAllUsersInGroupQuery = {};
// export type DeleteAllUsersInGroupBody = {
//   groupId: string; // 需要删除的团队 ID
// };
// export type DeleteAllUsersInGroupResponse = {
//   message: string;
// };

// /**
//  * 处理函数
//  * @param req API 请求
//  * @param res API 响应
//  * @returns 删除结果
//  */
// async function handler(
//   req: ApiRequestProps<DeleteAllUsersInGroupBody, DeleteAllUsersInGroupQuery>,
//   res: ApiResponseType<DeleteAllUsersInGroupResponse>
// ): Promise<any> {
//   const { groupId } = req.body;

//   try {
//     // 删除团队中所有用户
//     await deleteAllUsersByGroupId(groupId);

//     // 返回成功响应
//     return res.status(200).json({ message: '团队中所有用户删除成功' });
//   } catch (error) {
//     console.error('团队中所有用户删除失败:', error);
//     return res.status(500).json({ message: '团队中所有用户删除失败', error });
//   }
// }

// export default NextAPI(handler);
