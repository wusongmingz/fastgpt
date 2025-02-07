import { NextAPI } from '@/service/middleware/entry';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

async function handler(req: ApiRequestProps, res: ApiResponseType) {}
export default NextAPI(handler);
