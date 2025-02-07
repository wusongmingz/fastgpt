import React, { useState } from 'react';
import { Box, Flex, Icon, Image } from '@chakra-ui/react'; // 添加 Icon
import { AddIcon } from '@chakra-ui/icons';
import FolderModal from './component/Selective';
import { serviceSideProps } from '@/web/common/utils/i18n';
import Link from 'next/link';
const TestPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box
      style={{
        width: '100%',
        height: '91.5vh',
        padding: '10px',
        boxSizing: 'border-box'
      }}
    >
      <Flex
        style={{
          width: '100%',
          height: '100%',
          border: '1px',
          backgroundColor: '#f0f4fa',
          borderRadius: '10px',
          position: 'relative'
        }}
      >
        <Box
          style={{
            width: '98.5%',
            height: '8%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: 10,
            borderRadius: '10px',
            margin: '0 10px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box
            style={{
              width: '50px',
              height: '50px',
              position: 'relative',
              marginLeft: '20px'
            }}
          >
            <Image src="/imgs/images/picture/书籍.png" alt="书籍" objectFit="contain" />
          </Box>
          <p style={{ fontSize: 20, fontWeight: 'bold', margin: 0, padding: '0 0 0 10px' }}>
            我的知识库
          </p>
        </Box>
        <Box
          style={{
            width: '98.5%',
            height: 'calc(100% - 86px)',
            display: 'flex',
            flexWrap: 'wrap', // 添加 flex-wrap
            margin: '0 10px',
            position: 'absolute',
            borderRadius: '10px',
            top: 86,
            overflowY: 'auto' // 添加滚动条
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            w="310px"
            h="270px"
            borderRadius="10px"
            mr={'50px'}
            mb={'20px'}
            overflow="hidden"
            position="relative"
            boxShadow="10px 10px 5px 1px rgba(0, 0, 0, 0.4)"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '50px 50px 0 0',
              borderColor: 'red transparent transparent transparent',
              zIndex: 1
            }}
          >
            <Image
              src="/imgs/images/picture/shutterstock_667327240.jpg"
              alt="image"
              objectFit="cover"
            />
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            w="310px"
            h="270px"
            bg={'#f8f8f1'}
            borderRadius="10px"
            mb={'20px'} // 添加底部外边距
            overflow="hidden"
            position="relative"
            boxShadow="10px 10px 5px 1px rgba(0, 0, 0, 0.4)"
            cursor="pointer" // 添加鼠标悬浮变手指
            onClick={() => setIsOpen(true)} // 点击显示FolderModal
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '50px 50px 0 0',
              borderColor: 'red transparent transparent transparent',
              zIndex: 1
            }}
          >
            <Icon as={AddIcon} w={53} h={53} color="red" /> {/* 在这里显示图标 */}
            <FolderModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default TestPage;
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app', 'user']))
    }
  };
}
