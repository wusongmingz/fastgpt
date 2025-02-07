import { BoxProps } from '@chakra-ui/react';

export const textareaMinH = '22px';

export const MessageCardStyle: BoxProps = {
  px: 3,
  py: 2,
  borderRadius: '8px 8px 8px 8px',
  boxShadow: 'none',
  display: 'inline-block',
  maxW: ['calc(100% - 25px)', 'calc(100% - 80px)'],
  color: 'myGray.900'
};

export enum FeedbackTypeEnum {
  user = 'user',
  admin = 'admin',
  hidden = 'hidden'
}
