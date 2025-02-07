import { Box, Flex, HStack, Image } from '@chakra-ui/react';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useEffect, useRef, useState } from 'react';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import AIcon from '../AIcon/AIcon';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { TeamType } from '@/global/core/chat/api';

const LayoutHeader = ({
  userInfo,
  userMenuList,
  defaultTeam
}: {
  userInfo: any;
  userMenuList: any[];
  defaultTeam: TeamType | undefined;
}) => {
  const [isShowUserInfoMenu, setIsShowUserInfoMenu] = useState(false);
  const userInfoMenuRef = useRef<HTMLDivElement>(null);

  const displayMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      if (
        userInfoMenuRef.current &&
        !userInfoMenuRef.current.contains(e.target as Node) &&
        !displayMenuRef.current?.contains(e.target as Node)
      ) {
        setIsShowUserInfoMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutSide);
    return () => {
      document.removeEventListener('click', handleClickOutSide);
    };
  }, [userInfoMenuRef.current]);
  return (
    <>
      <Flex
        h={'80px'}
        backgroundColor={'rgb(255,255,255,0.8)'}
        justifyContent={'space-between'}
        alignItems={'center'}
        zIndex={999}
      >
        <Image
          src="/imgs/home/tianyuanlogo.png"
          alt={''}
          mt={'10px'}
          ml={'20px'}
          w={'224px'}
          h={'70px'}
        ></Image>
        <HStack
          w={'180px'}
          h={'50px'}
          mr={'40px'}
          ref={displayMenuRef}
          cursor={'pointer'}
          onClick={() => {
            setIsShowUserInfoMenu(!isShowUserInfoMenu);
          }}
          //  onClick={() => router.push('/account')}
        >
          <Avatar
            w={'36px'}
            h={'36px'}
            borderRadius={'50%'}
            m={'2px'}
            src={userInfo?.avatar}
            fallbackSrc={HUMAN_ICON}
          />
          <Box
            flex={1}
            alignContent={'center'}
            textAlign={'center'}
            userSelect={'none'}
            fontSize={'16px'}
          >
            {userInfo?.username}
          </Box>
          <AIcon
            name="icon-youfangxiangjiantou"
            position={'relative'}
            fontSize="12px"
            transition={'0.3s'}
            transform={isShowUserInfoMenu ? 'rotate(90deg)' : ''}
          ></AIcon>
          {isShowUserInfoMenu && (
            <Flex
              mt={'40px'}
              ref={userInfoMenuRef}
              w={'180px'}
              left={'calc(100% - 220px)'}
              top={'40px'}
              // h={'140px'}
              bgColor={'white'}
              boxShadow={3.5}
              borderRadius={'md'}
              // borderWidth={'1px'}
              // borderColor={'#c0c0c0'}
              position={'absolute'}
              flexDirection={'column'}
              userSelect={'none'}
            >
              <Flex
                alignContent={'center'}
                alignItems={'center'}
                p={'5px'}
                borderBottom={'1px solid #d7d7d7'}
              >
                <Avatar
                  w={'30px'}
                  h={'30px'}
                  borderRadius={'50%'}
                  m={'2px'}
                  mr={'10px'}
                  src={defaultTeam?.avatar || HUMAN_ICON}
                  // fallbackSrc={defaultTeam?.avatar}
                />
                {defaultTeam?.name}
              </Flex>
              {userMenuList.map((item) => (
                <Flex
                  key={item.name}
                  py={2}
                  px={2.5}
                  onClick={item.onclick}
                  cursor={'pointer'}
                  _hover={{
                    bg: 'rgb(243,243,243)'
                  }}
                >
                  {item.leftAvatar ? (
                    <Avatar
                      w={'20px'}
                      borderRadius={'50%'}
                      src={item?.leftAvatar}
                      fallbackSrc={HUMAN_ICON}
                    />
                  ) : (
                    <AIcon name={item.icon} fontSize="20px" cursor={'pointer'}></AIcon>
                  )}
                  <Box flex={1} alignContent={'center'} pl={5} fontSize={'13px'}>
                    {item.name}
                  </Box>
                  {item.rightIcon && (
                    <AIcon
                      name={item.rightIcon}
                      transition={'0.3s'}
                      transform={item.isopen ? 'rotate(90deg)' : ''}
                      fontSize="20px"
                    ></AIcon>
                  )}
                </Flex>
              ))}
            </Flex>
          )}
        </HStack>
      </Flex>
    </>
  );
};

export default LayoutHeader;
