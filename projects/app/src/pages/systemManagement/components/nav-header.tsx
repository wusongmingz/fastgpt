import { Button, Flex } from '@chakra-ui/react';

type TabType = 'team' | 'user';

interface Props {
  currentTab: TabType;
  onTabClick: (type: TabType) => void;
}

const NavHeader = ({ currentTab, onTabClick }: Props) => {
  return (
    <Flex
      alignItems={'center'}
      h={'40px'}
      gap={8}
      bgColor={'#fff'}
      borderRadius={'lg'}
      px={4}
      py={1}
      mb={3}
    >
      <Button
        rounded={'lg'}
        variant={'whiteCommon'}
        w={'100px'}
        minH={'30px'}
        bgColor={currentTab === 'team' ? '#EDF1F4' : '#FFF'}
        onClick={() => onTabClick('team')}
      >
        团队管理
      </Button>
      <Button
        rounded={'lg'}
        variant={'whiteCommon'}
        w={'100px'}
        minH={'30px'}
        bgColor={currentTab === 'user' ? '#EDF1F4' : '#FFF'}
        onClick={() => onTabClick('user')}
      >
        用户管理
      </Button>
    </Flex>
  );
};

export default NavHeader;
