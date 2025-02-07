import fs from 'fs';
import { getAxiosConfig } from '../config';
import axios from 'axios';
import FormData from 'form-data';

export const aiTranscriptions = async ({
  model,
  fileStream
}: {
  model: string;
  fileStream: fs.ReadStream;
}) => {
  // 读取音频流并转换为 Base64
  const chunks: Buffer[] = [];
  for await (const chunk of fileStream) {
    chunks.push(chunk);
  }
  const fileBuffer = Buffer.concat(chunks.map((chunk) => new Uint8Array(chunk)));
  const audioBase64 = fileBuffer.toString('base64'); // 转换为 Base64
  console.log('ASR_Base64 数据_lay:', audioBase64);
  // 构造新的请求体
  const payload = {
    audio: audioBase64, // 音频的 Base64 数据
    format: 'mp3', // 假设格式为 mp3
    language: 'zh', // 假设语言为中文
    filename: 'fastgpt'
  };

  // 获取 Axios 配置
  const aiAxiosConfig = getAxiosConfig();

  const { data: result } = await axios<{ code: number; msg: string; data: { text: string } }>({
    method: 'post',
    baseURL: process.env.ASR_BASE_URL,
    url: '/gateway/asr?model=whisper',
    headers: {
      // apiKey: 'sk-a010d9dbbe9b4f0d946c7bc43b49367a',
      apiKey: process.env.ASR_BASE_URL_KEY,
      'Content-Type': 'application/json'
    },
    data: payload // 使用新的请求体
  });
  console.log('ASR请求结果_lay:', result);
  // 提取 data 中的 text 字段
  const { text } = result.data; // result.data.text 即为你要返回的字段
  console.log('ASR请求结果_lay:', text);

  return text; // 返回提取的 text 字段
};
