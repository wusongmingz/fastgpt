import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { InitChatResponse } from './api';

export const defaultChatData: InitChatResponse = {
  chatId: '',
  appId: '',
  app: {
    name: 'Loading',
    avatar: '/imgs/tianyuanlogo.png',
    intro: '',
    selectColor: '#002FA7',
    canUse: false,
    type: AppTypeEnum.simple,
    pluginInputs: []
  },
  title: '',
  variables: {}
};

export enum GetChatTypeEnum {
  normal = 'normal',
  outLink = 'outLink',
  team = 'team'
}
