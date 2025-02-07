// @ts-nocheck
import { serviceSideProps } from '@/web/common/utils/i18n';
import { Box, Flex } from '@chakra-ui/react';
import MyBox from '@fastgpt/web/components/common/MyBox';
import TeamManage from '../components/team-manage';
import NavHeader from '../components/nav-header';
import { useState } from 'react';
import UserManage from '../components/user-manage';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getTeamListNew } from '@/web/support/user/team/api';

enum TabEnum {
  team = 'team',
  user = 'user'
}
interface Team {
  _id: string;
  name: string;
  avatar: string;
  intro: string;
}

export default function SystemManagement() {
  const router = useRouter();
  const { tab = 'team', groupId } = router.query as { tab: `${TabEnum}`; groupId: string };

  // const [currentTab, setCurrentTab] = useState<`${TabEnum}`>(tab || 'team');
  const [teamList, setTeamList] = useState<Team[]>([]);

  const { loading } = useRequest2(() => getTeamListNew(), {
    manual: false,
    onSuccess: (data) => {
      setTeamList(data);
    }
  });

  return (
    <MyBox
      flexDirection={'column'}
      height={'calc(100vh - 100px)'}
      margin={'10px 10px 10px 0px'}
      p={2}
      overflowY={'auto'}
      overflowX={'hidden'}
      borderRadius={'10px'}
      bg={'#eceff6'}
      isLoading={loading}
    >
      <Flex flexDirection={'column'} h={'100%'}>
        <NavHeader
          currentTab={tab}
          onTabClick={(type: `${TabEnum}`) => {
            router.push({ query: { tab: type, groupId } });
          }}
        />
        <PageContainer h={'calc(100% - 50px)'} pr={0} pt={[0, 0]}>
          {tab === TabEnum.team && <TeamManage />}
          {tab === TabEnum.user && <UserManage />}
        </PageContainer>
      </Flex>
    </MyBox>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app', 'user']))
    }
  };
}
