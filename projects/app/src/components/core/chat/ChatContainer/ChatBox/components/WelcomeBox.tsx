import { Box, Card } from '@chakra-ui/react';
import React from 'react';
import { MessageCardStyle } from '../constants';
import Markdown from '@/components/Markdown';
import ChatAvatar from './ChatAvatar';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '../Provider';

const WelcomeBox = ({ welcomeText }: { welcomeText: string }) => {
  const appAvatar = useContextSelector(ChatBoxContext, (v) => v.appAvatar);

  return (
    <Box py={3}>
      {/* avatar */}
      <ChatAvatar src={'/imgs/images/picture/bigmodel.png'} type={'AI'} />
      {/* message */}
      <Box textAlign={'left'} ml={8}>
        <Card
          order={2}
          mt={2}
          {...MessageCardStyle}
          bg={'white'}
          border={'1px solid #91C6DE'}
          // boxShadow={'0 0 8px rgba(0,0,0,0.15)'}
        >
          <Markdown source={`~~~guide \n${welcomeText}`} forbidZhFormat />
        </Card>
      </Box>
    </Box>
  );
};

export default WelcomeBox;
